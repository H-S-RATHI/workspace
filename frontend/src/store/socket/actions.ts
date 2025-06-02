import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../authStore'
import type { SocketStore } from './types'
import { SOCKET_CONFIG, SOCKET_EVENTS, INITIAL_SOCKET_STATE } from './constants'
import { setupSocketEventHandlers } from './eventHandlers'
// Connection Management Actions
export const createConnectionActions = (
  set: (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void,
  get: () => SocketStore
) => ({
  connect: () => {
    const { accessToken } = useAuthStore.getState()
    
    if (!accessToken || get().socket?.connected) {
      return
    }
    try {
      // Ensure we have a clean URL without trailing slashes
      // Remove /api/v1 from the URL if present, as Socket.IO needs to connect to the root
      let baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:12000').replace(/\/+$/, '')
      baseUrl = baseUrl.replace(/\/api\/v1$/, '') // Remove /api/v1 if present
      
      console.log('Initializing socket connection to:', baseUrl)
      
      // Create socket instance with explicit configuration
      const newSocket = io(baseUrl, {
        // Authentication
        auth: {
          token: accessToken,
        },
        // Connection settings - create a new array to ensure it's mutable
        transports: [...SOCKET_CONFIG.TRANSPORTS],
        path: SOCKET_CONFIG.PATH,
        autoConnect: false,  // We'll connect manually after setting up handlers
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
        // Timeout settings
        timeout: SOCKET_CONFIG.TIMEOUT,
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
          version: SOCKET_CONFIG.CLIENT_VERSION
        }
      })
      
      // Debug logging
      console.log('Socket instance created, setting up event listeners...')
      
      // Setup all event handlers
      setupSocketEventHandlers(newSocket, set, get)
      
      // Manually connect after setting up all event listeners
      console.log('Attempting to connect socket...')
      newSocket.connect()
      
      // Store the socket in the state
      set({ socket: newSocket })
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      toast.error('Failed to connect to the server')
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
  }
})
// Conversation Management Actions
export const createConversationActions = (
  set: (partial: Partial<SocketStore>) => void,
  get: () => SocketStore
) => ({
  joinConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId })
    }
  },
  leaveConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId })
    }
  }
})
// Message Management Actions
export const createMessageActions = (
  set: (partial: Partial<SocketStore>) => void,
  get: () => SocketStore
) => ({
  sendMessage: (conversationId: string, message: string, messageType = 'TEXT') => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationId,
        message,
        messageType,
      })
    }
  },
  startTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId })
    }
  },
  stopTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId })
    }
  }
})
// Call Management Actions
export const createCallActions = (
  set: (partial: Partial<SocketStore>) => void,
  get: () => SocketStore
) => ({
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_OFFER, {
        targetUserId,
        offer,
        callType,
      })
    }
  },
  answerCall: (callId: string, answer: any) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_ANSWER, { callId, answer })
    }
  },
  rejectCall: (callId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId })
    }
  },
  endCall: (callId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_END, { callId })
    }
  }
})