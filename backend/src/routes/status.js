const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { sendToUser } = require('../websocket/socketHandler');

const router = express.Router();

// Create new status
router.post('/', [
  authenticateToken,
  body('content').optional().isLength({ min: 1, max: 500 }),
  body('mediaUrl').optional().isURL(),
  body('mediaType').optional().isIn(['IMAGE', 'VIDEO', 'TEXT']),
  body('privacy').optional().isIn(['PUBLIC', 'CONTACTS', 'CLOSE_FRIENDS', 'CUSTOM']),
  body('backgroundColor').optional().isHexColor(),
  body('textColor').optional().isHexColor(),
  body('mentionedUsers').optional().isArray(),
  body('viewersList').optional().isArray(),
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

    const {
      content,
      mediaUrl,
      mediaType = 'TEXT',
      privacy = 'CONTACTS',
      backgroundColor = '#3b82f6',
      textColor = '#ffffff',
      mentionedUsers = [],
      viewersList = []
    } = req.body;

    // Validate that content or media is provided
    if (!content && !mediaUrl) {
      return res.status(400).json({
        success: false,
        error: 'Either content or media must be provided',
      });
    }

    // Validate mentioned users exist
    if (mentionedUsers.length > 0) {
      const validUsers = await db('users')
        .whereIn('userId', mentionedUsers)
        .where('isDeleted', false)
        .select('userId');
      
      if (validUsers.length !== mentionedUsers.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more mentioned users not found',
        });
      }
    }

    // Create status
    const statusId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const statusData = {
      statusId,
      userId: req.user.userId,
      content,
      mediaUrl,
      mediaType,
      backgroundColor,
      textColor,
      privacy,
      viewersList: privacy === 'CUSTOM' ? JSON.stringify(viewersList) : null,
      mentionedUsers: mentionedUsers.length > 0 ? JSON.stringify(mentionedUsers) : null,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('status_posts').insert(statusData);

    // Create mention records and send notifications
    if (mentionedUsers.length > 0) {
      const mentionData = mentionedUsers.map(mentionedUserId => ({
        mentionId: uuidv4(),
        statusId,
        mentionedUserId,
        mentionerUserId: req.user.userId,
        createdAt: new Date(),
      }));

      await db('status_mentions').insert(mentionData);

      // Send notifications to mentioned users
      const mentioner = await db('users')
        .where({ userId: req.user.userId })
        .select('username', 'fullName', 'profilePhotoUrl')
        .first();

      for (const mentionedUserId of mentionedUsers) {
        sendToUser(mentionedUserId, 'status_mention', {
          statusId,
          mentioner: {
            userId: req.user.userId,
            username: mentioner.username,
            fullName: mentioner.fullName,
            profilePhotoUrl: mentioner.profilePhotoUrl,
          },
          message: `${mentioner.fullName} mentioned you in their status`,
        });
      }
    }

    logger.info(`Status created: ${statusId}`, { 
      creator: req.user.username,
      privacy,
      mentions: mentionedUsers.length 
    });

    res.json({
      success: true,
      status: statusData,
      message: 'Status created successfully',
    });

  } catch (error) {
    logger.error('Create status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create status',
    });
  }
});

// Get status feed (stories from contacts and public)
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get user's contacts
    const contacts = await db('user_contacts')
      .where('userId', req.user.userId)
      .select('contactUserId');

    const contactIds = contacts.map(c => c.contactUserId);
    
    // Get conversations to determine who user has chatted with
    const conversations = await db('conversation_members')
      .join('conversation_members as other', function() {
        this.on('conversation_members.convoId', 'other.convoId')
            .andOn('conversation_members.userId', '!=', 'other.userId');
      })
      .where('conversation_members.userId', req.user.userId)
      .select('other.userId as chatUserId')
      .distinct();

    const chatUserIds = conversations.map(c => c.chatUserId);
    
    // Combine contacts and chat users
    const allowedUserIds = [...new Set([...contactIds, ...chatUserIds])];

    // Get status posts
    const statuses = await db('status_posts')
      .join('users', 'status_posts.userId', 'users.userId')
      .where('status_posts.expiresAt', '>', new Date())
      .where('users.isDeleted', false)
      .where(function() {
        this.where('status_posts.privacy', 'PUBLIC')
            .orWhere(function() {
              this.where('status_posts.privacy', 'CONTACTS')
                  .whereIn('status_posts.userId', allowedUserIds);
            })
            .orWhere('status_posts.userId', req.user.userId); // User's own statuses
      })
      .select(
        'status_posts.*',
        'users.username',
        'users.fullName',
        'users.profilePhotoUrl'
      )
      .orderBy('status_posts.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get view counts and check if user has viewed each status
    const statusesWithViews = await Promise.all(
      statuses.map(async (status) => {
        const [viewCount, userView] = await Promise.all([
          db('status_views').where('statusId', status.statusId).count('* as count').first(),
          db('status_views').where({ statusId: status.statusId, viewerId: req.user.userId }).first(),
        ]);

        return {
          ...status,
          viewCount: parseInt(viewCount.count),
          hasViewed: !!userView,
          mentionedUsers: status.mentionedUsers ? JSON.parse(status.mentionedUsers) : [],
          viewersList: status.viewersList ? JSON.parse(status.viewersList) : [],
        };
      })
    );

    res.json({
      success: true,
      statuses: statusesWithViews,
      pagination: {
        page,
        limit,
        hasMore: statuses.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get status feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status feed',
    });
  }
});

// Get user's own statuses
router.get('/my-statuses', authenticateToken, async (req, res) => {
  try {
    const statuses = await db('status_posts')
      .where('userId', req.user.userId)
      .where('expiresAt', '>', new Date())
      .orderBy('createdAt', 'desc');

    // Get view details for each status
    const statusesWithViews = await Promise.all(
      statuses.map(async (status) => {
        const views = await db('status_views')
          .join('users', 'status_views.viewerId', 'users.userId')
          .where('status_views.statusId', status.statusId)
          .select(
            'users.userId',
            'users.username',
            'users.fullName',
            'users.profilePhotoUrl',
            'status_views.viewedAt'
          )
          .orderBy('status_views.viewedAt', 'desc');

        return {
          ...status,
          viewCount: views.length,
          views,
          mentionedUsers: status.mentionedUsers ? JSON.parse(status.mentionedUsers) : [],
          viewersList: status.viewersList ? JSON.parse(status.viewersList) : [],
        };
      })
    );

    res.json({
      success: true,
      statuses: statusesWithViews,
    });

  } catch (error) {
    logger.error('Get my statuses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statuses',
    });
  }
});

// View a status
router.post('/:statusId/view', authenticateToken, async (req, res) => {
  try {
    const { statusId } = req.params;

    // Check if status exists and is not expired
    const status = await db('status_posts')
      .where('statusId', statusId)
      .where('expiresAt', '>', new Date())
      .first();

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Status not found or expired',
      });
    }

    // Check if user can view this status
    const canView = await checkStatusViewPermission(req.user.userId, status);
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this status',
      });
    }

    // Check if already viewed
    const existingView = await db('status_views')
      .where({ statusId, viewerId: req.user.userId })
      .first();

    if (!existingView) {
      // Record the view
      await db('status_views').insert({
        viewId: uuidv4(),
        statusId,
        viewerId: req.user.userId,
        viewedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Status viewed',
    });

  } catch (error) {
    logger.error('View status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to view status',
    });
  }
});

// Delete status
router.delete('/:statusId', authenticateToken, async (req, res) => {
  try {
    const { statusId } = req.params;

    // Check if status belongs to user
    const status = await db('status_posts')
      .where({ statusId, userId: req.user.userId })
      .first();

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Status not found',
      });
    }

    // Delete status (cascade will handle related records)
    await db('status_posts').where('statusId', statusId).del();

    logger.info(`Status deleted: ${statusId}`, { user: req.user.username });

    res.json({
      success: true,
      message: 'Status deleted successfully',
    });

  } catch (error) {
    logger.error('Delete status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete status',
    });
  }
});

// Add contact
router.post('/contacts', [
  authenticateToken,
  body('contactUserId').isUUID(),
  body('contactName').optional().isLength({ min: 1, max: 100 }),
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

    const { contactUserId, contactName } = req.body;

    if (contactUserId === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot add yourself as contact',
      });
    }

    // Check if contact user exists
    const contactUser = await db('users')
      .where({ userId: contactUserId, isDeleted: false })
      .first();

    if (!contactUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already a contact
    const existingContact = await db('user_contacts')
      .where({ userId: req.user.userId, contactUserId })
      .first();

    if (existingContact) {
      return res.status(400).json({
        success: false,
        error: 'User is already in your contacts',
      });
    }

    // Add contact
    await db('user_contacts').insert({
      contactId: uuidv4(),
      userId: req.user.userId,
      contactUserId,
      contactName: contactName || contactUser.fullName,
      addedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Contact added successfully',
    });

  } catch (error) {
    logger.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add contact',
    });
  }
});

// Helper function to check status view permission
async function checkStatusViewPermission(viewerId, status) {
  if (status.userId === viewerId) {
    return true; // Own status
  }

  switch (status.privacy) {
    case 'PUBLIC':
      return true;
    
    case 'CONTACTS':
      // Check if viewer is in contacts or has chatted
      const isContact = await db('user_contacts')
        .where({ userId: status.userId, contactUserId: viewerId })
        .first();
      
      if (isContact) return true;
      
      // Check if they have chatted
      const hasConversation = await db('conversation_members as cm1')
        .join('conversation_members as cm2', 'cm1.convoId', 'cm2.convoId')
        .where('cm1.userId', status.userId)
        .where('cm2.userId', viewerId)
        .first();
      
      return !!hasConversation;
    
    case 'CUSTOM':
      const viewersList = status.viewersList ? JSON.parse(status.viewersList) : [];
      return viewersList.includes(viewerId);
    
    default:
      return false;
  }
}

module.exports = router;