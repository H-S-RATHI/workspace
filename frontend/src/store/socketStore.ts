import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

import { useAuthStore } from './authStore'
import type { Message, Conversation } from '../types/chat'

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
      return
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:12000', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    })

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      set({ isConnected: true })
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      set({ isConnected: false })
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      toast.error('Connection failed')
    })

    // User presence events
    socket.on('online_users', (users: string[]) => {
      set({ onlineUsers: users })
    })

    socket.on('user_status_change', ({ userId, status }) => {
      const { onlineUsers } = get()
      if (status === 'online') {
        set({ onlineUsers: [...onlineUsers.filter(id => id !== userId), userId] })
      } else {
        set({ onlineUsers: onlineUsers.filter(id => id !== userId) })
      }
    })

    // Message events
    socket.on('new_message', (message: Message) => {
      // This will be handled by the chat store or components
      console.log('New message received:', message)
    })

    socket.on('message_delivered', ({ messageId }) => {
      console.log('Message delivered:', messageId)
    })

    socket.on('message_read', ({ messageId }) => {
      console.log('Message read:', messageId)
    })

    // Typing events
    socket.on('user_typing', ({ userId, username, conversationId }) => {
      const { typingUsers } = get()
      const currentTyping = typingUsers[conversationId] || []
      
      if (!currentTyping.includes(userId)) {
        set({
          typingUsers: {
            ...typingUsers,
            [conversationId]: [...currentTyping, userId],
          },
        })
      }
    })

    socket.on('user_stopped_typing', ({ userId, conversationId }) => {
      const { typingUsers } = get()
      const currentTyping = typingUsers[conversationId] || []
      
      set({
        typingUsers: {
          ...typingUsers,
          [conversationId]: currentTyping.filter(id => id !== userId),
        },
      })
    })

    // Call events
    socket.on('incoming_call', ({ callId, callerId, callerUsername, offer, callType }) => {
      console.log('Incoming call:', { callId, callerId, callerUsername, callType })
      // This will be handled by the call store or components
    })

    socket.on('call_answered', ({ callId, answer }) => {
      console.log('Call answered:', callId)
    })

    socket.on('call_rejected', ({ callId }) => {
      console.log('Call rejected:', callId)
      toast.error('Call was rejected')
    })

    socket.on('call_ended', ({ callId }) => {
      console.log('Call ended:', callId)
    })

    socket.on('ice_candidate', ({ fromUserId, candidate }) => {
      console.log('ICE candidate received from:', fromUserId)
    })

    // Error events
    socket.on('error', ({ message }) => {
      toast.error(message)
    })

    set({ socket })
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