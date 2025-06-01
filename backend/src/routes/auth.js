const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { db, cache } = require('../config/database');
const { authenticateToken, sensitiveOperationLimit } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { sendOTP, sendEmail } = require('../services/notificationService');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('phoneNumber')
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
];

const loginValidation = [
  body('phoneNumber')
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
];

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Step 1: Send OTP for signup/login
router.post('/send-otp', [
  ...loginValidation,
  sensitiveOperationLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { phoneNumber, email } = req.body;

    if (!phoneNumber && !email) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or email is required',
      });
    }

    const identifier = phoneNumber || email;
    const identifierType = phoneNumber ? 'phone' : 'email';

    // If this is a signup request (has fullName), check if user already exists
    if (req.body.fullName) {
      const existingUser = await db('users')
        .where(phoneNumber ? { phoneNumber } : { email })
        .where({ isDeleted: false })
        .first();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'An account with this ' + (phoneNumber ? 'phone number' : 'email') + ' already exists',
          errorCode: 'ACCOUNT_EXISTS',
          existingUser: {
            userId: existingUser.userId,
            username: existingUser.username,
            email: existingUser.email,
            phoneNumber: existingUser.phoneNumber
          },
          message: 'Please log in instead.'
        });
      }
    }

    // Check rate limiting
    const rateLimitKey = `otp_rate_limit:${identifier}`;
    const attempts = await cache.get(rateLimitKey) || 0;
    
    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Too many OTP requests. Please try again later.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpKey = `otp:${identifier}`;
    const attemptsKey = `otp_attempts:${identifier}`;

    // Store OTP in cache (5 minutes expiry)
    await cache.set(otpKey, otp, 300);
    await cache.set(attemptsKey, 0, 300);
    await cache.set(rateLimitKey, attempts + 1, 3600); // 1 hour rate limit

    // Send OTP
    if (identifierType === 'phone') {
      await sendOTP(phoneNumber, otp);
    } else {
      await sendEmail(email, 'Your Verification Code', `Your verification code is: ${otp}`);
    }

    logger.info(`OTP sent to ${identifier}`, { identifier, type: identifierType });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      identifier,
      expiresIn: 300, // 5 minutes
    });

  } catch (error) {
    logger.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
});

// Step 2: Verify OTP and signup/login
router.post('/verify-otp', [
  // Use loginValidation but don't require fullName
  body('phoneNumber')
    .optional()
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  sensitiveOperationLimit(5, 15 * 60 * 1000),
], async (req, res) => {
  console.log('OTP Verification Request:', JSON.stringify({
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  }, null, 2));
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { phoneNumber, email, otp, fullName } = req.body;
    const identifier = phoneNumber || email;

    // Define OTP keys
    const otpKey = `otp:${identifier}`;
    const attemptsKey = `otp_attempts:${identifier}`;
    const attempts = await cache.get(attemptsKey) || 0;

    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Get stored OTP
    const storedOtp = await cache.get(otpKey);
    
    // Development mode: Accept '123456' as valid OTP or match with stored OTP
    if (otp !== '123456' && otp !== storedOtp) {
      await cache.set(attemptsKey, attempts + 1, 300);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    // Check if user exists
    const existingUser = await db('users')
      .where(phoneNumber ? { phoneNumber } : { email })
      .where({ isDeleted: false })
      .first();

    let user;
    let isNewUser = false;

    if (existingUser) {
      // If user exists and is trying to sign up again, prompt them to log in
      if (fullName) {
        return res.status(400).json({
          success: false,
          error: 'An account with this phone number already exists',
          errorCode: 'ACCOUNT_EXISTS',
          existingUser: {
            userId: existingUser.userId,
            username: existingUser.username,
            email: existingUser.email,
            phoneNumber: existingUser.phoneNumber
          },
          message: 'Please log in instead.'
        });
      }
      
      // Existing user login
      user = existingUser;
    } else {
      // New user signup
      if (!fullName) {
        return res.status(400).json({
          success: false,
          error: 'Full name is required for new users',
        });
      }

      isNewUser = true;
      const userId = uuidv4();
      
      // Generate unique username
      const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let username = baseUsername;
      let counter = 1;
      
      while (await db('users').where({ username }).first()) {
        username = `${baseUsername}_${counter}`;
        counter++;
      }

      // Create new user
      const userData = {
        userId,
        username,
        fullName,
        phoneNumber: phoneNumber || null,
        email: email || null,
        isDeleted: false,
        twoFaEnabled: false,
        usernameChangesLeft: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db('users').insert(userData);
      user = userData;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.userId);

    // Store refresh token
    await cache.set(`refresh_token:${user.userId}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Clean up OTP data
    await cache.del(otpKey);
    await cache.del(attemptsKey);

    logger.info(`User ${isNewUser ? 'signed up' : 'logged in'}`, { 
      userId: user.userId, 
      username: user.username 
    });

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePhotoUrl: user.profilePhotoUrl,
        twoFaEnabled: user.twoFaEnabled,
        isBusinessAccount: user.isBusinessAccount || false,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      isNewUser,
    });

  } catch (error) {
    console.error('Verify OTP error details:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    logger.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type',
      });
    }

    // Check if refresh token exists in cache
    const storedToken = await cache.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update stored refresh token
    await cache.set(`refresh_token:${decoded.userId}`, newRefreshToken, 30 * 24 * 60 * 60);

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticateToken, async (req, res) => {
  try {
    const { method } = req.body; // 'SMS' or 'TOTP'

    if (!['SMS', 'TOTP'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid 2FA method',
      });
    }

    if (method === 'TOTP') {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `SocialMarketplace (${req.user.username})`,
        issuer: 'SocialMarketplace',
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Store secret temporarily (user needs to verify)
      await cache.set(`2fa_setup:${req.user.userId}`, secret.base32, 600); // 10 minutes

      res.json({
        success: true,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        message: 'Scan the QR code with your authenticator app and verify with a code',
      });
    } else {
      // SMS 2FA setup would require additional phone number
      res.json({
        success: true,
        message: 'SMS 2FA setup - implement phone number collection',
      });
    }

  } catch (error) {
    logger.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup 2FA',
    });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa-setup', [
  authenticateToken,
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { code } = req.body;

    // Get stored secret
    const secret = await cache.get(`2fa_setup:${req.user.userId}`);
    if (!secret) {
      return res.status(400).json({
        success: false,
        error: '2FA setup session expired',
      });
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Enable 2FA for user
    await db('users')
      .where({ userId: req.user.userId })
      .update({
        twoFaEnabled: true,
        twoFaMethod: 'TOTP',
        twoFaSecretHash: await bcrypt.hash(secret, 12),
        updatedAt: new Date(),
      });

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    // Store backup codes (hashed)
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 12))
    );

    await db('user_backup_codes').insert(
      hashedBackupCodes.map(hash => ({
        userId: req.user.userId,
        codeHash: hash,
        isUsed: false,
        createdAt: new Date(),
      }))
    );

    // Clean up setup session
    await cache.del(`2fa_setup:${req.user.userId}`);

    logger.info(`2FA enabled for user ${req.user.username}`);

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes,
    });

  } catch (error) {
    logger.error('Verify 2FA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA setup',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        // Try to verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If token is valid, clear the refresh token
        if (decoded && decoded.userId) {
          await cache.del(`refresh_token:${decoded.userId}`);
          logger.info(`User ${decoded.userId} logged out`);
        }
      } catch (error) {
        // If token is invalid or expired, we still want to proceed with logout
        // but we'll log it for debugging purposes
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
          logger.debug(`Logout with invalid/expired token: ${error.message}`);
        } else {
          logger.error('Error during logout token verification:', error);
        }
      }
    }

    // Clear any client-side tokens by setting expired cookies
    res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Clear Authorization header
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    logger.error('Logout error:', error);
    // Even if there's an error, we still want to clear the tokens
    res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db('users')
      .where({ userId: req.user.userId })
      .select('userId', 'username', 'fullName', 'email', 'phoneNumber', 'twoFaEnabled', 'createdAt')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    logger.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
    });
  }
});

module.exports = router;