const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { logger } = require('../utils/logger');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

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
        twoFaEnabled: user.twoFaEnabled,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user context
    req.user = null;
    next();
  }
};

// Check if user has specific role/permission
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const user = await db('users')
        .where({ userId: req.user.userId })
        .first();

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

// Check if account is business tier
const requireBusinessTier = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const user = await db('users')
      .where({ userId: req.user.userId })
      .first();

    if (!user || !user.isBusinessAccount) {
      return res.status(403).json({
        success: false,
        error: 'Business account required',
      });
    }

    next();
  } catch (error) {
    logger.error('Business tier check error:', error);
    res.status(500).json({
      success: false,
      error: 'Business tier check failed',
    });
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.user ? req.user.userId : '');
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    attempts.set(key, validAttempts);

    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Too many attempts, please try again later',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current attempt
    validAttempts.push(now);
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireBusinessTier,
  sensitiveOperationLimit,
};