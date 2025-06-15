import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../authStore';
import { SOCKET_CONFIG } from './constants';
import { setupSocketEventHandlers } from './eventHandlers';
import type { ActionCreator } from './types';
// ======================
// Connection Management
// ======================
export const createConnectionActions: ActionCreator = (set, get) => ({
  disconnect: (): void => {
    const { socket } = get();
    if (socket) {
      console.log('[SocketStore][disconnect] Disconnecting socket...');
      socket.disconnect();
      set({ socket: null });
    }
  },
  
  connect: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const accessToken = useAuthStore.getState().accessToken;
      const state = get();
      
      console.log('[SocketStore][connect] Attempting to connect...', {
        hasAccessToken: !!accessToken,
        isAlreadyConnected: state.socket?.connected,
        socketExists: !!state.socket
      });
      
      // With HttpOnly cookies, accessToken is not directly available in JS.
      // The browser will send the cookie if withCredentials is true and same-origin policies are met.
      // The check for accessToken presence here is removed.
      // if (!accessToken) { // This check is removed
      //   const error = new Error('Cannot connect: No access token available');
      //   console.error('[SocketStore][connect]', error.message);
      //   return reject(error);
      // }
      
      if (state.socket?.connected) {
        console.log('[SocketStore][connect] Socket already connected, skipping...');
        return resolve();
      }
      
      try {
        let baseUrl = import.meta.env.VITE_SOCKET_URL;
        let usingDefaultUrl = false;

        if (!baseUrl) {
          console.warn('[SocketStore][connect] VITE_SOCKET_URL is not defined. Falling back to default: http://localhost:12000');
          baseUrl = 'http://localhost:12000';
          usingDefaultUrl = true;
        }
        
        // Ensure we have a clean URL without trailing slashes
        baseUrl = baseUrl.replace(/\/+$/, '');

        console.log('[SocketStore][connect] Preparing WebSocket connection with:', {
          targetUrl: baseUrl,
          envSocketUrl: import.meta.env.VITE_SOCKET_URL,
          usingDefault: usingDefaultUrl,
        });
        
        console.log('[SocketStore][connect] Creating socket instance with options for URL:', baseUrl, {
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
        // Authentication (auth property) is removed as HttpOnly cookie is used.
        // Query parameters for token are also removed.
        const newSocket = io(baseUrl, {
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
          withCredentials: true, // This is crucial for sending HttpOnly cookies
          // Force new connection to avoid issues with reconnection
          forceNew: true,
          // Disable multiplexing to avoid potential issues
          multiplex: false,
          // Add query parameters if needed (but not token)
          query: {
            // token: accessToken, // Removed
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
        
        resolve();
      } catch (error) {
        console.error('Failed to initialize socket:', error)
        toast.error('Failed to connect to the server')
        reject(error);
      }
    });
  },
  
  disconnectAndCleanup: () => {
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
});