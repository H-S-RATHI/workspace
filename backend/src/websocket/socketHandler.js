const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { logger } = require('../utils/logger');

// Store active connections
const activeConnections = new Map();
const userSockets = new Map(); // userId -> Set of socket IDs

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    logger.debug('Authenticating socket connection', {
      socketId: socket.id,
      auth: socket.handshake.auth,
      headers: socket.handshake.headers
    });

    const token = socket.handshake.auth.token || 
                 (socket.handshake.headers.authorization && 
                  socket.handshake.headers.authorization.split(' ')[1]);
    
    if (!token) {
      logger.warn('No authentication token provided', { socketId: socket.id });
      return next(new Error('Authentication token required'));
    }

    logger.debug('Verifying JWT token', { socketId: socket.id });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    logger.debug('Fetching user from database', { userId: decoded.userId });
    const user = await db('users')
      .where({ userId: decoded.userId, isDeleted: false })
      .first()
      .timeout(5000, { cancel: true });

    if (!user) {
      logger.warn('User not found in database', { userId: decoded.userId });
      return next(new Error('User not found'));
    }

    // Attach user info to socket for later use
    socket.userId = user.userId;
    socket.username = user.username;
    
    logger.debug('Socket authentication successful', {
      socketId: socket.id,
      userId: user.userId,
      username: user.username
    });
    
    next();
  } catch (error) {
    logger.error('Socket authentication error', {
      error: error.message,
      stack: error.stack,
      socketId: socket.id
    });
    
    // Send more specific error messages based on the error type
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    } else if (error.name === 'TimeoutError') {
      return next(new Error('Database timeout'));
    }
    
    next(new Error('Authentication failed'));
  }
};

// Initialize Socket.IO handlers
const initializeSocket = (io) => {
  // Handle default namespace
  const defaultNamespace = io.of('/');
  
  // Log namespace initialization
  logger.info('Initializing Socket.IO default namespace');
  
  // Authentication middleware for default namespace
  defaultNamespace.use((socket, next) => {
    logger.debug(`Authenticating socket connection: ${socket.id}`);
    authenticateSocket(socket, next);
  });

  // Handle connection on default namespace
  defaultNamespace.on('connection', (socket) => {
    logger.debug(`New socket connection: ${socket.id}`, {
      userId: socket.userId,
      handshake: {
        headers: socket.handshake.headers,
        auth: socket.handshake.auth,
        query: socket.handshake.query
      }
    });
    
    if (!socket.userId) {
      const error = new Error('Unauthenticated connection attempt');
      logger.warn(`Disconnecting unauthenticated socket: ${socket.id}`, { error: error.message });
      socket.emit('error', { message: 'Authentication required' });
      socket.disconnect(true);
      return;
    }
    
    logger.info(`User ${socket.userId} (${socket.username}) connected with socket ${socket.id}`);
    
    // Store connection
    const userConnections = userSockets.get(socket.userId) || new Set();
    userConnections.add(socket.id);
    userSockets.set(socket.userId, userConnections);
    
    activeConnections.set(socket.id, {
      userId: socket.userId,
      username: socket.username,
      connectedAt: new Date(),
    });
    
    // Notify others about user coming online
    socket.broadcast.emit('user_status_change', {
      userId: socket.userId,
      status: 'online'
    });
    
    // Send current online users to the connected client
    socket.emit('online_users', Array.from(userSockets.keys()));
    userSockets.get(socket.userId).add(socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Emit user online status to friends
    emitUserStatus(socket.userId, 'online');

    // Handle joining conversation rooms
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Verify user is member of conversation
        const membership = await db('conversation_members')
          .where({
            convoId: conversationId,
            userId: socket.userId,
          })
          .first();

        if (membership) {
          socket.join(`conversation:${conversationId}`);
          socket.emit('joined_conversation', { conversationId });
          logger.debug(`User ${socket.username} joined conversation ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
      } catch (error) {
        logger.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message, messageType = 'TEXT' } = data;
        
        // Reject empty/null/whitespace-only messages
        if (!message || typeof message !== 'string' || message.trim() === '') {
          socket.emit('error', { message: 'Message content cannot be empty.' });
          return;
        }
        
        // Verify user is member of conversation
        const membership = await db('conversation_members')
          .where({
            convoId: conversationId,
            userId: socket.userId,
          })
          .first();

        if (!membership) {
          socket.emit('error', { message: 'Not authorized to send messages to this conversation' });
          return;
        }

        // Create message in database
        const messageId = require('uuid').v4();
        const messageData = {
          messageId,
          convoId: conversationId,
          senderId: socket.userId,
          msgType: messageType,
          contentText: message,
          timestamp: new Date(),
          status: 'SENT',
        };

        await db('messages').insert(messageData);

        // Update conversation last message timestamp
        await db('conversations')
          .where({ convoId: conversationId })
          .update({ lastMessageAt: new Date() });

        // Emit message to all conversation members
        io.to(`conversation:${conversationId}`).emit('new_message', {
          ...messageData,
          senderUsername: socket.username,
        });

        // Send push notifications to offline users
        await sendMessageNotifications(conversationId, socket.userId, message);

      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        conversationId,
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        username: socket.username,
        conversationId,
      });
    });

    // Handle call signaling
    socket.on('call_offer', async (data) => {
      try {
        const { targetUserId, offer, callType = 'video' } = data;
        
        // Create call record
        const callId = require('uuid').v4();
        await db('calls').insert({
          callId,
          callerId: socket.userId,
          calleeId: targetUserId,
          callType,
          status: 'RINGING',
          startedAt: new Date(),
        });

        // Send offer to target user
        io.to(`user:${targetUserId}`).emit('incoming_call', {
          callId,
          callerId: socket.userId,
          callerUsername: socket.username,
          offer,
          callType,
        });

      } catch (error) {
        logger.error('Error handling call offer:', error);
        socket.emit('call_error', { message: 'Failed to initiate call' });
      }
    });

    socket.on('call_answer', async (data) => {
      const { callId, answer } = data;
      
      try {
        // Update call status
        await db('calls')
          .where({ callId })
          .update({ status: 'ACTIVE' });

        // Get call details
        const call = await db('calls')
          .where({ callId })
          .first();

        if (call) {
          // Send answer to caller
          io.to(`user:${call.callerId}`).emit('call_answered', {
            callId,
            answer,
          });
        }
      } catch (error) {
        logger.error('Error handling call answer:', error);
      }
    });

    socket.on('call_reject', async (data) => {
      const { callId } = data;
      
      try {
        // Update call status
        await db('calls')
          .where({ callId })
          .update({ 
            status: 'REJECTED',
            endedAt: new Date(),
          });

        // Get call details
        const call = await db('calls')
          .where({ callId })
          .first();

        if (call) {
          // Notify caller
          io.to(`user:${call.callerId}`).emit('call_rejected', { callId });
        }
      } catch (error) {
        logger.error('Error handling call rejection:', error);
      }
    });

    socket.on('call_end', async (data) => {
      const { callId } = data;
      
      try {
        // Update call status
        await db('calls')
          .where({ callId })
          .update({ 
            status: 'ENDED',
            endedAt: new Date(),
          });

        // Get call details
        const call = await db('calls')
          .where({ callId })
          .first();

        if (call) {
          // Notify both participants
          io.to(`user:${call.callerId}`).emit('call_ended', { callId });
          io.to(`user:${call.calleeId}`).emit('call_ended', { callId });
        }
      } catch (error) {
        logger.error('Error handling call end:', error);
      }
    });

    // Handle ICE candidates for WebRTC
    socket.on('ice_candidate', (data) => {
      const { targetUserId, candidate } = data;
      io.to(`user:${targetUserId}`).emit('ice_candidate', {
        fromUserId: socket.userId,
        candidate,
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`User ${socket.username} disconnected: ${reason}`);
      
      // Remove from active connections
      activeConnections.delete(socket.id);
      
      // Remove from user sockets
      if (userSockets.has(socket.userId)) {
        userSockets.get(socket.userId).delete(socket.id);
        
        // If no more sockets for this user, mark as offline
        if (userSockets.get(socket.userId).size === 0) {
          userSockets.delete(socket.userId);
          emitUserStatus(socket.userId, 'offline');
        }
      }
    });

    // Send initial online users list
    socket.emit('online_users', getOnlineUsers());
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, connection] of activeConnections.entries()) {
      if (now - connection.connectedAt.getTime() > staleThreshold) {
        const socket = io.sockets.sockets.get(socketId);
        if (!socket || !socket.connected) {
          activeConnections.delete(socketId);
          logger.debug(`Cleaned up stale connection: ${socketId}`);
        }
      }
    }
  }, 60000); // Run every minute
};

// Helper functions
const emitUserStatus = (userId, status) => {
  // Emit to user's friends/contacts
  // This would require getting the user's friend list from the database
  // For now, we'll emit to all connected users
  activeConnections.forEach((connection, socketId) => {
    if (connection.userId !== userId) {
      const socket = require('../server').io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('user_status_change', { userId, status });
      }
    }
  });
};

const getOnlineUsers = () => {
  const onlineUsers = [];
  userSockets.forEach((sockets, userId) => {
    if (sockets.size > 0) {
      const connection = Array.from(activeConnections.values())
        .find(conn => conn.userId === userId);
      if (connection) {
        onlineUsers.push({
          userId,
          username: connection.username,
        });
      }
    }
  });
  return onlineUsers;
};

const sendMessageNotifications = async (conversationId, senderId, message) => {
  try {
    // Get conversation members who are not online
    const members = await db('conversation_members')
      .join('users', 'conversation_members.userId', 'users.userId')
      .where('conversation_members.convoId', conversationId)
      .where('conversation_members.userId', '!=', senderId)
      .select('users.userId', 'users.username', 'users.email', 'users.phoneNumber');

    for (const member of members) {
      // Check if user is online
      if (!userSockets.has(member.userId)) {
        // Send push notification (implement based on your notification service)
        logger.debug(`Would send push notification to ${member.username} for new message`);
      }
    }
  } catch (error) {
    logger.error('Error sending message notifications:', error);
  }
};

// Utility function to send message to specific user
const sendToUser = (userId, event, data) => {
  const userSocketIds = userSockets.get(userId);
  if (userSocketIds) {
    userSocketIds.forEach(socketId => {
      const socket = require('../server').io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });
  }
};

// Utility function to send message to conversation
const sendToConversation = (conversationId, event, data) => {
  require('../server').io.to(`conversation:${conversationId}`).emit(event, data);
};

module.exports = {
  initializeSocket,
  sendToUser,
  sendToConversation,
  getOnlineUsers,
};