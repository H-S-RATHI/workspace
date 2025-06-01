const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Email transporter setup
let emailTransporter;

const initializeEmailTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use console transport for development
    emailTransporter = {
      sendMail: async (options) => {
        logger.info('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text,
        });
        return { messageId: 'dev-message-id' };
      }
    };
  } else {
    // Production email setup
    emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

// Initialize transporter
initializeEmailTransporter();

// Send OTP via SMS
const sendOTP = async (phoneNumber, otp) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Mock SMS sending in development
      logger.info(`📱 SMS OTP would be sent to ${phoneNumber}: ${otp}`);
      return { success: true, messageId: 'dev-sms-id' };
    }

    // Production SMS sending using Twilio
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await twilio.messages.create({
      body: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`SMS OTP sent successfully`, { 
      phoneNumber, 
      messageId: message.sid 
    });

    return { success: true, messageId: message.sid };

  } catch (error) {
    logger.error('Failed to send SMS OTP:', error);
    throw new Error('Failed to send SMS verification code');
  }
};

// Send email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@socialmarketplace.com',
      to,
      subject,
      text,
      html: html || text,
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully`, { 
      to, 
      subject, 
      messageId: result.messageId 
    });

    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to Social Marketplace!';
  const text = `
    Hi ${userName},

    Welcome to Social Marketplace! We're excited to have you join our community.

    Here's what you can do:
    • Connect with friends through messaging and video calls
    • Share your moments with Stories and Reels
    • Discover amazing content from creators worldwide
    • Buy and sell products in our marketplace

    Get started by completing your profile and connecting with friends.

    Best regards,
    The Social Marketplace Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to Social Marketplace!</h1>
      <p>Hi ${userName},</p>
      <p>Welcome to Social Marketplace! We're excited to have you join our community.</p>
      
      <h3>Here's what you can do:</h3>
      <ul>
        <li>Connect with friends through messaging and video calls</li>
        <li>Share your moments with Stories and Reels</li>
        <li>Discover amazing content from creators worldwide</li>
        <li>Buy and sell products in our marketplace</li>
      </ul>
      
      <p>Get started by completing your profile and connecting with friends.</p>
      
      <p>Best regards,<br>The Social Marketplace Team</p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset Your Password';
  const text = `
    You requested a password reset for your Social Marketplace account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p>You requested a password reset for your Social Marketplace account.</p>
      
      <p>
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
};

// Send login alert email
const sendLoginAlertEmail = async (userEmail, deviceInfo) => {
  const subject = 'New Login to Your Account';
  const text = `
    We noticed a new login to your Social Marketplace account:
    
    Device: ${deviceInfo.device}
    Browser: ${deviceInfo.browser}
    Location: ${deviceInfo.location}
    Time: ${deviceInfo.timestamp}
    
    If this was you, you can ignore this email.
    If this wasn't you, please secure your account immediately.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">New Login to Your Account</h1>
      <p>We noticed a new login to your Social Marketplace account:</p>
      
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Device:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${deviceInfo.device}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Browser:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${deviceInfo.browser}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${deviceInfo.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${deviceInfo.timestamp}</td>
        </tr>
      </table>
      
      <p>If this was you, you can ignore this email.</p>
      <p><strong>If this wasn't you, please secure your account immediately.</strong></p>
    </div>
  `;

  return await sendEmail(userEmail, subject, text, html);
};

// Send push notification (placeholder for future implementation)
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // This would integrate with Firebase Cloud Messaging or similar service
    logger.info(`📱 Push notification would be sent to user ${userId}:`, {
      title,
      body,
      data,
    });

    // In production, implement actual push notification sending
    return { success: true };

  } catch (error) {
    logger.error('Failed to send push notification:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to multiple users
const sendBulkNotifications = async (userIds, title, body, data = {}) => {
  try {
    const results = await Promise.allSettled(
      userIds.map(userId => sendPushNotification(userId, title, body, data))
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    logger.info(`Bulk notifications sent: ${successful}/${userIds.length} successful`);

    return {
      success: true,
      total: userIds.length,
      successful,
      failed: userIds.length - successful,
    };

  } catch (error) {
    logger.error('Failed to send bulk notifications:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTP,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLoginAlertEmail,
  sendPushNotification,
  sendBulkNotifications,
};