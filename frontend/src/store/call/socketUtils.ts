/**
 * Utility functions for socket operations and validation
 */
export const validateSocketConnection = (useSocketStore: any): void => {
    const socketStore = useSocketStore.getState();
    console.log('[SocketUtils] Socket store state:', { 
      isConnected: socketStore.isConnected, 
      socket: !!socketStore.socket 
    });
    
    if (!socketStore.isConnected || !socketStore.socket) {
      console.error('[SocketUtils] WebSocket is not connected');
      throw new Error('WebSocket connection is not established');
    }
  };
  export const sendCallOffer = async (
    useSocketStore: any,
    targetUserId: string,
    offer: RTCSessionDescriptionInit,
    callType: 'audio' | 'video'
  ): Promise<void> => {
    console.log('[SocketUtils] Sending call offer to peer:', targetUserId);
    
    try {
      const socket = useSocketStore.getState().socket;
      if (!socket) {
        throw new Error('Socket not initialized');
      }
      
      if (!socket.connected) {
        console.log('[SocketUtils] Socket not connected, attempting to connect...');
        await new Promise<void>((resolve, reject) => {
          const onConnect = () => {
            socket.off('connect', onConnect);
            resolve();
          };
          
          const onError = (error: any) => {
            socket.off('connect_error', onError);
            reject(new Error(`Socket connection error: ${error?.message || 'Unknown error'}`));
          };
          
          socket.once('connect', onConnect);
          socket.once('connect_error', onError);
          
          // If socket is already connecting, this will be a no-op
          socket.connect();
        });
      }
      
      console.log('[SocketUtils] Socket connected, sending call offer...');
      
      const response = await new Promise<void>((resolve, reject) => {
        // Set a timeout for the entire operation
        const timeout = setTimeout(() => {
          reject(new Error('Call offer timeout'));
        }, 15000); // 15 seconds timeout
        
        try {
          // Use the event name from SOCKET_EVENTS
          socket.emit('call_offer', {
            targetUserId,
            offer,
            callType,
          }, (response: { success: boolean; error?: string }) => {
            clearTimeout(timeout);
            
            if (response?.success) {
              console.log('[SocketUtils] Call offer sent successfully');
              resolve();
            } else {
              const errorMsg = response?.error || 'Failed to send call offer';
              console.error('[SocketUtils] Call offer failed:', errorMsg);
              reject(new Error(errorMsg));
            }
          });
        } catch (error) {
          clearTimeout(timeout);
          console.error('[SocketUtils] Error in socket.emit:', error);
          reject(error);
        }
      });
      
      return response;
    } catch (error) {
      console.error('[SocketUtils] Error in sendCallOffer:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };
  export const sendCallAnswer = (
    useSocketStore: any,
    callId: string,
    localDescription: RTCSessionDescriptionInit
  ): void => {
    console.log('[SocketUtils] Sending answer to caller');
    
    const { answerCall } = useSocketStore.getState();
    answerCall(callId, localDescription);
  };
  export const sendCallRejection = (
    useSocketStore: any,
    callId: string
  ): void => {
    console.log('[SocketUtils] Sending call:reject event');
    
    const { rejectCall } = useSocketStore.getState();
    rejectCall(callId);
  };
  export const sendCallEnd = (
    useSocketStore: any,
    callId: string
  ): void => {
    console.log('[SocketUtils] Sending call end notification');
    
    const { endCall } = useSocketStore.getState();
    endCall(callId);
  };