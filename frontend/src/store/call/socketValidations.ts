/**
 * Socket validation and connection utilities
 */
import { SOCKET_TIMEOUTS, LOG_PREFIXES } from './socketConstants';
/**
 * Validates if the socket connection is established and ready
 * @param useSocketStore - The socket store hook
 * @throws Error if WebSocket is not connected
 */
export const validateSocketConnection = (useSocketStore: any): void => {
  const socketStore = useSocketStore.getState();
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket store state:`, { 
    isConnected: socketStore.isConnected, 
    socket: !!socketStore.socket 
  });
  
  if (!socketStore.isConnected || !socketStore.socket) {
    console.error(`${LOG_PREFIXES.SOCKET_UTILS} WebSocket is not connected`);
    throw new Error('WebSocket connection is not established');
  }
};
/**
 * Helper function to wait for socket connection with timeout
 * @param socket - The socket instance
 * @returns Promise that resolves when socket is connected
 * @throws Error if connection times out or fails
 */
export const ensureSocketConnected = async (socket: any): Promise<void> => {
  if (socket.connected) return;
  
  return new Promise<void>((resolve, reject) => {
    console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket not connected, attempting to connect...`);
    
    const connectionTimeout = setTimeout(() => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      reject(new Error('Socket connection timeout'));
    }, SOCKET_TIMEOUTS.CONNECTION_TIMEOUT);
    
    const onConnect = () => {
      clearTimeout(connectionTimeout);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket connected successfully`);
      resolve();
    };
    
    const onError = (error: any) => {
      clearTimeout(connectionTimeout);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      console.error(`${LOG_PREFIXES.SOCKET_UTILS} Socket connection error:`, error);
      reject(new Error(`Socket connection error: ${error?.message || 'Unknown error'}`));
    };
    
    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
    
    // Only connect if not already connecting/connected
    if (!socket.active) {
      console.log(`${LOG_PREFIXES.SOCKET_UTILS} Manually connecting socket...`);
      socket.connect();
    }
  });
};
/**
 * Validates and logs socket instance details
 * @param socket - The socket instance to validate
 * @throws Error if socket is invalid
 */
export const validateSocketInstance = (socket: any): void => {
  // Debug log the socket instance
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket instance:`, {
    isSocketIO: socket && 'io' in socket,
    connected: socket?.connected,
    id: socket?.id,
    active: socket?.active,
    disconnect: typeof socket?.disconnect,
    on: typeof socket?.on,
    off: typeof socket?.off,
    emit: typeof socket?.emit
  });
  if (!socket) {
    const error = new Error('Socket not initialized');
    console.error(`${LOG_PREFIXES.SOCKET_UTILS}`, error.message);
    throw error;
  }
  // Verify if we have a valid socket.io instance
  if (!('io' in socket)) {
    console.error(`${LOG_PREFIXES.SOCKET_UTILS} Invalid socket instance - missing io property`);
    throw new Error('Invalid socket instance');
  }
};
/**
 * Logs current socket state for debugging
 * @param socket - The socket instance
 */
export const logSocketState = (socket: any): void => {
  const socketState = {
    connected: socket.connected,
    id: socket.id,
    active: socket.active,
    disconnected: socket.disconnected,
    isSocketIO: 'io' in socket,
    hasListeners: typeof socket.hasListeners === 'function' ? socket.hasListeners('call_offer') : 'N/A',
    eventNames: typeof socket.eventNames === 'function' ? socket.eventNames() : 'N/A'
  };
  console.log(`${LOG_PREFIXES.SOCKET_UTILS} Socket state:`, socketState);
};