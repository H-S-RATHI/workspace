const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { sendToConversation } = require('../websocket/socketHandler');

const router = express.Router();

// Get conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const conversations = await db('conversations')
      .join('conversation_members', 'conversations.convoId', 'conversation_members.convoId')
      .where('conversation_members.userId', req.user.userId)
      .select(
        'conversations.convoId',
        'conversations.isGroup',
        'conversations.groupName',
        'conversations.groupPhotoUrl',
        'conversations.lastMessageAt',
        'conversations.createdAt'
      )
      .orderBy('conversations.lastMessageAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get additional info for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get last message
        const lastMessage = await db('messages')
          .join('users', 'messages.senderId', 'users.userId')
          .where('messages.convoId', conv.convoId)
          .select(
            'messages.messageId',
            'messages.msgType',
            'messages.contentText',
            'messages.timestamp',
            'users.username as senderUsername'
          )
          .orderBy('messages.timestamp', 'desc')
          .first();

        // Get unread count
        const unreadCount = await db('messages')
          .where('convoId', conv.convoId)
          .where('senderId', '!=', req.user.userId)
          .where('status', '!=', 'READ')
          .count('* as count')
          .first();

        // Get conversation members
        const members = await db('conversation_members')
          .join('users', 'conversation_members.userId', 'users.userId')
          .where('conversation_members.convoId', conv.convoId)
          .select(
            'users.userId',
            'users.username',
            'users.fullName',
            'users.profilePhotoUrl',
            'conversation_members.role'
          );

        // For one-on-one chats, get the other participant's info
        let displayName = conv.groupName;
        let displayPhoto = conv.groupPhotoUrl;
        
        if (!conv.isGroup && members.length === 2) {
          const otherMember = members.find(m => m.userId !== req.user.userId);
          if (otherMember) {
            displayName = otherMember.fullName;
            displayPhoto = otherMember.profilePhotoUrl;
          }
        }

        return {
          ...conv,
          displayName,
          displayPhoto,
          lastMessage,
          unreadCount: parseInt(unreadCount.count),
          members,
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithDetails,
      pagination: {
        page,
        limit,
        hasMore: conversations.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations',
    });
  }
});

// Create new conversation
router.post('/conversations', [
  authenticateToken,
  body('participantIds').isArray({ min: 1, max: 7 }).withMessage('Must have 1-7 participants'),
  body('isGroup').optional().isBoolean(),
  body('groupName').optional().isLength({ min: 1, max: 50 }),
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

    const { participantIds, isGroup = false, groupName } = req.body;
    
    // Add current user to participants if not included
    const allParticipants = [...new Set([req.user.userId, ...participantIds])];
    
    if (allParticipants.length > 8) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 8 participants allowed',
      });
    }

    // For one-on-one chats, check if conversation already exists
    if (!isGroup && allParticipants.length === 2) {
      const existingConversation = await db('conversations')
        .join('conversation_members as cm1', 'conversations.convoId', 'cm1.convoId')
        .join('conversation_members as cm2', 'conversations.convoId', 'cm2.convoId')
        .where('conversations.isGroup', false)
        .where('cm1.userId', allParticipants[0])
        .where('cm2.userId', allParticipants[1])
        .select('conversations.convoId')
        .first();

      if (existingConversation) {
        return res.json({
          success: true,
          conversation: { convoId: existingConversation.convoId },
          message: 'Conversation already exists',
        });
      }
    }

    // Verify all participants exist
    const validParticipants = await db('users')
      .whereIn('userId', allParticipants)
      .where('isDeleted', false)
      .select('userId');

    if (validParticipants.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more participants not found',
      });
    }

    // Create conversation
    const convoId = uuidv4();
    const conversationData = {
      convoId,
      isGroup,
      groupName: isGroup ? groupName : null,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('conversations').insert(conversationData);

    // Add members
    const memberData = allParticipants.map(userId => ({
      convoId,
      userId,
      role: userId === req.user.userId ? 'ADMIN' : 'MEMBER',
      joinedAt: new Date(),
    }));

    await db('conversation_members').insert(memberData);

    logger.info(`Conversation created: ${convoId}`, { 
      creator: req.user.username,
      participants: allParticipants.length,
      isGroup 
    });

    res.json({
      success: true,
      conversation: conversationData,
      message: 'Conversation created successfully',
    });

  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
    });
  }
});

// Get conversation messages
router.get('/conversations/:convoId/messages', authenticateToken, async (req, res) => {
  try {
    const { convoId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is member of conversation
    const membership = await db('conversation_members')
      .where({ convoId, userId: req.user.userId })
      .first();

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this conversation',
      });
    }

    // Get messages
    const messages = await db('messages')
      .join('users', 'messages.senderId', 'users.userId')
      .where('messages.convoId', convoId)
      .select(
        'messages.messageId',
        'messages.senderId',
        'messages.msgType',
        'messages.contentText',
        'messages.contentUrl',
        'messages.timestamp',
        'messages.status',
        'users.username as senderUsername',
        'users.profilePhotoUrl as senderPhoto'
      )
      .orderBy('messages.timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    // Mark messages as read
    await db('messages')
      .where('convoId', convoId)
      .where('senderId', '!=', req.user.userId)
      .where('status', '!=', 'READ')
      .update({ status: 'READ' });

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages',
    });
  }
});

// Send message
router.post('/conversations/:convoId/messages', [
  authenticateToken,
  body('message')
    .exists({ checkFalsy: true })
    .withMessage('Message content is required')
    .bail()
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('messageType').optional().isIn(['TEXT', 'IMAGE', 'VOICE', 'LOCATION', 'PAYMENT']),
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

    const { convoId } = req.params;
    const { message, messageType = 'TEXT', contentUrl } = req.body;

    // Manual check for whitespace-only messages
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.',
      });
    }

    // Verify user is member of conversation
    const membership = await db('conversation_members')
      .where({ convoId, userId: req.user.userId })
      .first();

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages to this conversation',
      });
    }

    // Create message
    const messageId = uuidv4();
    const messageData = {
      messageId,
      convoId,
      senderId: req.user.userId,
      msgType: messageType,
      contentText: message || null,
      contentUrl: contentUrl || null,
      timestamp: new Date(),
      status: 'SENT',
    };

    await db('messages').insert(messageData);

    // Update conversation last message timestamp
    await db('conversations')
      .where({ convoId })
      .update({ lastMessageAt: new Date() });

    // Get sender info for real-time broadcast
    const senderInfo = await db('users')
      .where({ userId: req.user.userId })
      .select('username', 'profilePhotoUrl')
      .first();

    // Broadcast message to conversation members via WebSocket
    sendToConversation(convoId, 'new_message', {
      ...messageData,
      senderUsername: senderInfo.username,
      senderPhoto: senderInfo.profilePhotoUrl,
    });

    logger.info(`Message sent in conversation ${convoId}`, { 
      sender: req.user.username,
      messageType 
    });

    res.json({
      success: true,
      message: {
        ...messageData,
        senderUsername: senderInfo.username,
        senderPhoto: senderInfo.profilePhotoUrl,
      },
    });

  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
});

// Get call history
router.get('/calls', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const calls = await db('calls')
      .leftJoin('users as caller', 'calls.callerId', 'caller.userId')
      .leftJoin('users as callee', 'calls.calleeId', 'callee.userId')
      .where(function() {
        this.where('calls.callerId', req.user.userId)
            .orWhere('calls.calleeId', req.user.userId);
      })
      .select(
        'calls.callId',
        'calls.callType',
        'calls.status',
        'calls.startedAt',
        'calls.endedAt',
        'calls.callerId',
        'calls.calleeId',
        'caller.username as callerUsername',
        'caller.fullName as callerName',
        'caller.profilePhotoUrl as callerPhoto',
        'callee.username as calleeUsername',
        'callee.fullName as calleeName',
        'callee.profilePhotoUrl as calleePhoto'
      )
      .orderBy('calls.startedAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Calculate call duration and format for display
    const callsWithDuration = calls.map(call => {
      let duration = null;
      if (call.endedAt && call.startedAt) {
        const durationMs = new Date(call.endedAt) - new Date(call.startedAt);
        duration = Math.floor(durationMs / 1000); // Duration in seconds
      }

      // Determine if this was an incoming or outgoing call
      const isIncoming = call.calleeId === req.user.userId;
      const otherParty = isIncoming ? {
        userId: call.callerId,
        username: call.callerUsername,
        fullName: call.callerName,
        profilePhotoUrl: call.callerPhoto,
      } : {
        userId: call.calleeId,
        username: call.calleeUsername,
        fullName: call.calleeName,
        profilePhotoUrl: call.calleePhoto,
      };

      return {
        callId: call.callId,
        callType: call.callType,
        status: call.status,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration,
        isIncoming,
        otherParty,
      };
    });

    res.json({
      success: true,
      calls: callsWithDuration,
      pagination: {
        page,
        limit,
        hasMore: calls.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get call history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get call history',
    });
  }
});

module.exports = router;