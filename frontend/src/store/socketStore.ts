import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

import { useAuthStore } from './authStore'
import type { Message } from '../types/chat'

// Type definitions for socket events
interface UserStatusChangeEvent {
  userId: string;
  status: 'online' | 'offline';
}

interface TypingEvent {
  userId: string;
  username: string;
  conversationId: string;
}

interface CallEvent {
  callId: string;
  [key: string]: any;
}

interface OnlineUsersEvent extends Array<string> {}

interface ErrorEvent {
  message: string;
  [key: string]: any;
}

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  typingUsers: Record<string, string[]> // conversationId -> userIds
}

interface SocketActions {
  connect: () => void
  disconnect: () => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, message: string, messageType?: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => void
  answerCall: (callId: string, answer: any) => void
  rejectCall: (callId: string) => void
  endCall: (callId: string) => void
}

type SocketStore = SocketState & SocketActions

export const useSocketStore = create<SocketStore>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: {},

  // Actions
  connect: () => {
    const { accessToken } = useAuthStore.getState()
    
    if (!accessToken || get().socket?.connected) {
      return;
    }

    try {
      // Ensure we have a clean URL without trailing slashes
      // Remove /api/v1 from the URL if present, as Socket.IO needs to connect to the root
      let baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:12000').replace(/\/+$/, '');
      baseUrl = baseUrl.replace(/\/api\/v1$/, ''); // Remove /api/v1 if present
      
      console.log('Initializing socket connection to:', baseUrl);
      
      // Create socket instance with explicit configuration
      const newSocket = io(baseUrl, {
        // Authentication
        auth: {
          token: accessToken,
        },
        // Connection settings
        transports: ['websocket', 'polling'],
        path: '/socket.io/', // Must match server-side path
        autoConnect: false,  // We'll connect manually after setting up handlers
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Timeout settings
        timeout: 20000,
        // Security
        withCredentials: true,
        // Force new connection to avoid issues with reconnection
        forceNew: true,
        // Disable multiplexing to avoid potential issues
        multiplex: false,
        // Add query parameters if needed
        query: {
          token: accessToken,
          client: 'web',
          version: '1.0.0'
        }
      });
      
      // Debug logging
      console.log('Socket instance created, setting up event listeners...');
      
      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        set({ isConnected: true });
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        set({ isConnected: false });
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection failed');
      });

      // User presence events
      newSocket.on('online_users', (users: OnlineUsersEvent) => {
        set({ onlineUsers: users });
      });

      newSocket.on('user_status_change', ({ userId, status }: UserStatusChangeEvent) => {
        const { onlineUsers } = get();
        if (status === 'online') {
          set({ onlineUsers: [...onlineUsers.filter(id => id !== userId), userId] });
        } else {
          set({ onlineUsers: onlineUsers.filter(id => id !== userId) });
        }
      });

      // Message events
      newSocket.on('new_message', (message: Message) => {
        // This will be handled by the chat store or components
        console.log('New message received:', message);
      });

      newSocket.on('message_delivered', ({ messageId }: { messageId: string }) => {
        console.log('Message delivered:', messageId);
      });

      newSocket.on('message_read', ({ messageId }: { messageId: string }) => {
        console.log('Message read:', messageId);
      });

      // Typing events
      newSocket.on('user_typing', ({ userId, username: _username, conversationId }: TypingEvent) => {
        const { typingUsers } = get();
        const currentTyping = typingUsers[conversationId] || [];
        
        if (!currentTyping.includes(userId)) {
          set({
            typingUsers: {
              ...typingUsers,
              [conversationId]: [...currentTyping, userId],
            },
          });
        }
      });

      newSocket.on('user_stopped_typing', ({ userId, conversationId }: { userId: string, conversationId: string }) => {
        const { typingUsers } = get();
        const currentTyping = typingUsers[conversationId] || [];
        
        set({
          typingUsers: {
            ...typingUsers,
            [conversationId]: currentTyping.filter(id => id !== userId),
          },
        });
      });

      // Call events
      newSocket.on('incoming_call', (data: CallEvent) => {
        const { callId, callerId, callerUsername, callType } = data;
        console.log('Incoming call:', { callId, callerId, callerUsername, callType });
        // This will be handled by the call store or components
      });

      newSocket.on('call_answered', (data: CallEvent) => {
        console.log('Call answered:', data.callId);
      });

      newSocket.on('call_rejected', (data: CallEvent) => {
        console.log('Call rejected:', data.callId);
        toast.error('Call was rejected');
      });

      newSocket.on('call_ended', (data: CallEvent) => {
        console.log('Call ended:', data.callId);
      });

      newSocket.on('ice_candidate', (data: { fromUserId: string, candidate: any }) => {
        console.log('ICE candidate received from:', data.fromUserId);
      });

      // Error events
      newSocket.on('error', (data: ErrorEvent) => {
        toast.error(data.message);
      });
      
      // Manually connect after setting up all event listeners
      console.log('Attempting to connect socket...');
      newSocket.connect();
      
      // Store the socket in the state
      set({ socket: newSocket });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      toast.error('Failed to connect to the server');
    }
  },

  disconnect: () => {
    const { socket } = get()
    
    if (socket) {
      socket.disconnect()
      set({
        socket: null,
        isConnected: false,
        onlineUsers: [],
        typingUsers: {},
      })
    }
  },

  joinConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('join_conversation', { conversationId })
    }
  },

  leaveConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('leave_conversation', { conversationId })
    }
  },

  sendMessage: (conversationId: string, message: string, messageType = 'TEXT') => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('send_message', {
        conversationId,
        message,
        messageType,
      })
    }
  },

  startTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('typing_start', { conversationId })
    }
  },

  stopTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('typing_stop', { conversationId })
    }
  },

  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('call_offer', {
        targetUserId,
        offer,
        callType,
      })
    }
  },

  answerCall: (callId: string, answer: any) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('call_answer', { callId, answer })
    }
  },

  rejectCall: (callId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('call_reject', { callId })
    }
  },

  endCall: (callId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit('call_end', { callId })
    }
  },
}))