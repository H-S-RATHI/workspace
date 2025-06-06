import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../authStore'
import type { SocketStore } from './types'
import { SOCKET_CONFIG, SOCKET_EVENTS } from './constants'
import { setupSocketEventHandlers } from './eventHandlers'

// Connection Management Actions
export const createConnectionActions = (
  set: (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void,
  get: () => SocketStore
) => ({
  connect: () => {
    const accessToken = useAuthStore.getState().accessToken
    const state = get()
    
    console.log('[SocketStore][connect] Attempting to connect...', {
      hasAccessToken: !!accessToken,
      isAlreadyConnected: state.socket?.connected,
      socketExists: !!state.socket
    });
    
    if (!accessToken) {
      console.error('[SocketStore][connect] Cannot connect: No access token available');
      return;
    }
    
    if (state.socket?.connected) {
      console.log('[SocketStore][connect] Socket already connected, skipping...');
      return;
    }
    try {
      // Ensure we have a clean URL without trailing slashes
      // Remove /api/v1 from the URL if present, as Socket.IO needs to connect to the root
      let baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:12000').replace(/\/+$/, '')
      const originalBaseUrl = baseUrl;
      baseUrl = baseUrl.replace(/\/api\/v1$/, '') // Remove /api/v1 if present
      
      console.log('[SocketStore][connect] Preparing connection with:', {
        originalBaseUrl,
        cleanBaseUrl: baseUrl,
        envApiUrl: import.meta.env.VITE_API_URL,
        usingDefault: !import.meta.env.VITE_API_URL
      });
      
      console.log('Initializing socket connection to:', baseUrl)
      
      console.log('[SocketStore][connect] Creating socket instance with options:', {
        baseUrl,
        transports: [...SOCKET_CONFIG.TRANSPORTS],
        path: SOCKET_CONFIG.PATH,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
        timeout: SOCKET_CONFIG.TIMEOUT,
        withCredentials: true,
        forceNew: true,
        multiplex: false
      });
      
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
      
      // Add connection state change listeners
      newSocket.on('connect', () => {
        console.log('[SocketStore][connect] Socket connected successfully', {
          socketId: newSocket.id,
          connected: newSocket.connected
        });
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('[SocketStore][connect] Socket connection error:', {
          error: error.message,
          name: error.name,
          stack: error.stack
        });
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('[SocketStore][connect] Socket disconnected:', reason);
      });
      
      // Manually connect after setting up all event listeners
      console.log('[SocketStore][connect] Attempting to connect socket...')
      newSocket.connect()
      
      // Store the socket in the state
      set({ socket: newSocket })
      console.log('[SocketStore][connect] Socket instance created and stored in state', {
        socketId: newSocket.id,
        connected: newSocket.connected
      })
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
  _set: (partial: Partial<SocketStore>) => void,
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
  _set: (partial: Partial<SocketStore>) => void,
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
  _set: (partial: Partial<SocketStore>) => void,
  get: () => SocketStore
) => ({
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => {
    const { socket } = get();
    
    console.log('[SocketStore][sendCallOffer] Sending call offer:', {
      targetUserId,
      callType,
      socketConnected: socket?.connected,
      socketId: socket?.id,
      offerType: offer?.type,
      offerSdp: offer?.sdp ? `${offer.sdp.substring(0, 50)}...` : 'No SDP'
    });
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_OFFER, {
        targetUserId,
        offer,
        callType,
      });
      console.log('[SocketStore][sendCallOffer] Call offer sent successfully');
    } else {
      console.error('[SocketStore][sendCallOffer] Cannot send offer: Socket not connected');
    }
  },
  answerCall: (callId: string, answer: any) => {
    const { socket } = get();
    
    console.log('[SocketStore][answerCall] Sending call answer:', {
      callId,
      socketConnected: socket?.connected,
      answerType: answer?.type,
      answerSdp: answer?.sdp ? `${answer.sdp.substring(0, 50)}...` : 'No SDP'
    });
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_ANSWER, { callId, answer });
      console.log('[SocketStore][answerCall] Call answer sent successfully');
    } else {
      console.error('[SocketStore][answerCall] Cannot send answer: Socket not connected');
    }
  },
  rejectCall: (callId: string) => {
    const { socket } = get();
    
    console.log('[SocketStore][rejectCall] Rejecting call:', {
      callId,
      socketConnected: socket?.connected
    });
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId });
      console.log('[SocketStore][rejectCall] Call rejection sent');
    } else {
      console.error('[SocketStore][rejectCall] Cannot reject call: Socket not connected');
    }
  },
  endCall: (callId: string) => {
    const { socket } = get();
    
    console.log('[SocketStore][endCall] Ending call:', {
      callId,
      socketConnected: socket?.connected
    });
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.CALL_END, { callId });
      console.log('[SocketStore][endCall] Call end signal sent');
    } else {
      console.error('[SocketStore][endCall] Cannot end call: Socket not connected');
    }
  },
  
  sendIceCandidate: (targetUserId: string, callId: string, candidate: RTCIceCandidate) => {
    const { socket } = get();
    
    console.log('[SocketStore][sendIceCandidate] Sending ICE candidate:', {
      targetUserId,
      callId,
      candidate: candidate ? {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
        usernameFragment: candidate.usernameFragment
      } : null,
      socketConnected: socket?.connected
    });
    
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
        targetUserId,
        callId,
        candidate: candidate ? {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
          usernameFragment: candidate.usernameFragment
        } : null
      });
      console.log('[SocketStore][sendIceCandidate] ICE candidate sent successfully');
    } else {
      console.error('[SocketStore][sendIceCandidate] Cannot send ICE candidate: Socket not connected');
    }
  }
})