const jwt = require('jsonwebtoken');
const { db, cache } = require('../config/database'); // Import cache
const { logger } = require('../utils/logger');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required. Please log in.',
        code: 'NO_TOKEN_PROVIDED',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await db('users')
      .where({ userId: decoded.userId, isDeleted: false })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or account deleted',
      });
    }

    // Add user info to request
    req.user = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role, // Add role
      isBusinessAccount: user.isBusinessAccount, // Add business account status
      twoFaEnabled: user.twoFaEnabled,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await db('users')
      .where({ userId: decoded.userId, isDeleted: false })
      .first();

    if (user) {
      req.user = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role, // Add role
        isBusinessAccount: user.isBusinessAccount, // Add business account status
        twoFaEnabled: user.twoFaEnabled,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid or expired, continue without user context
    // Log the error for debugging, but don't break the request flow
    logger.debug(`Optional auth error: ${error.message}`);
    req.user = null;
    next();
  }
};

// Check if user has specific role/permission
const requireRole = (requiredRoles) => {
  return (req, res, next) => { // Now synchronous
    if (!req.user || !req.user.userId) { // Check userId to ensure user object is populated from authenticateToken
      return res.status(401).json({
        success: false,
        error: 'Authentication required. User context not found.',
      });
    }

    // Ensure requiredRoles is an array, even if a single role string is passed
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!req.user.role || !rolesToCheck.includes(req.user.role)) {
      logger.warn(`Role check failed for user ${req.user.userId}. Required: ${rolesToCheck.join('|')}, User has: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. You do not have the required role.',
      });
    }

    next();
    // Synchronous function, global error handlers will catch unexpected issues.
  };
};

// Check if account is business tier
const requireBusinessTier = (req, res, next) => { // Now synchronous
  if (!req.user || !req.user.userId) { // Check userId to ensure user object is populated from authenticateToken
    return res.status(401).json({
      success: false,
      error: 'Authentication required. User context not found.',
    });
  }

  if (typeof req.user.isBusinessAccount === 'undefined') {
    logger.error(`isBusinessAccount not defined on req.user for user ${req.user.userId}. Ensure authenticateToken populates it.`);
    return res.status(500).json({
        success: false,
        error: 'User account type could not be determined. Please try again.',
    });
  }

  if (!req.user.isBusinessAccount) {
    logger.warn(`Business tier check failed for user ${req.user.userId}. User isBusinessAccount: ${req.user.isBusinessAccount}`);
    return res.status(403).json({
      success: false,
      error: 'A business account is required to access this feature.',
    });
  }

  next();
  // Synchronous function, global error handlers will catch unexpected issues.
};

// Rate limiting for sensitive operations using Redis
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000, operationName = 'sensitive_operation') => {
  return async (req, res, next) => {
    if (!cache.get || !cache.set) {
      logger.warn('Redis cache not available for rate limiting. Skipping.');
      return next();
    }

    const ipKey = `rate_limit:${operationName}:ip:${req.ip}`;
    const userKey = req.user ? `rate_limit:${operationName}:user:${req.user.userId}` : null;

    try {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Check IP-based rate limit
      const ipAttemptsRaw = await cache.get(ipKey);
      const ipAttempts = ipAttemptsRaw ? JSON.parse(ipAttemptsRaw) : [];
      const validIpAttempts = ipAttempts.filter(timestamp => timestamp > windowStart);

      if (validIpAttempts.length >= maxAttempts) {
        logger.warn(`Rate limit exceeded for IP ${req.ip} on operation ${operationName}`);
        return res.status(429).json({
          success: false,
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      // Check User-based rate limit (if user is authenticated)
      if (userKey) {
        const userAttemptsRaw = await cache.get(userKey);
        const userAttempts = userAttemptsRaw ? JSON.parse(userAttemptsRaw) : [];
        const validUserAttempts = userAttempts.filter(timestamp => timestamp > windowStart);

        if (validUserAttempts.length >= maxAttempts) {
          logger.warn(`Rate limit exceeded for user ${req.user.userId} on operation ${operationName}`);
          return res.status(429).json({
            success: false,
            error: 'Too many requests for this account, please try again later.',
            retryAfter: Math.ceil(windowMs / 1000),
          });
        }
        // Add current attempt for user
        validUserAttempts.push(now);
        await cache.set(userKey, JSON.stringify(validUserAttempts), Math.ceil(windowMs / 1000));
      }

      // Add current attempt for IP
      validIpAttempts.push(now);
      await cache.set(ipKey, JSON.stringify(validIpAttempts), Math.ceil(windowMs / 1000));

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      // Fail open in case of Redis error
      next();
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireBusinessTier,
  sensitiveOperationLimit,
};