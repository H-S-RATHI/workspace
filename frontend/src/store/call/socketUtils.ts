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
  console.log('[SocketUtils] Sending call offer to peer:', { 
    targetUserId, 
    callType,
    offerType: offer.type,
    sdp: offer.sdp ? `${offer.sdp.substring(0, 50)}...` : 'No SDP'
  });
  
  try {
    const socket = useSocketStore.getState().socket;
    if (!socket) {
      throw new Error('Socket not initialized');
    }
    
    // Log current socket state
    console.log('[SocketUtils] Socket state:', {
      connected: socket.connected,
      id: socket.id,
      active: socket.active
    });
    
    if (!socket.connected) {
      console.log('[SocketUtils] Socket not connected, attempting to connect...');
      
      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        console.error('[SocketUtils] Socket connection timeout');
        throw new Error('Socket connection timeout');
      }, 10000); // 10 seconds for connection
      
      try {
        await new Promise<void>((resolve, reject) => {
          const onConnect = () => {
            clearTimeout(connectionTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            console.log('[SocketUtils] Socket connected successfully');
            resolve();
          };
          
          const onError = (error: any) => {
            clearTimeout(connectionTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            console.error('[SocketUtils] Socket connection error:', error);
            reject(new Error(`Socket connection error: ${error?.message || 'Unknown error'}`));
          };
          
          socket.once('connect', onConnect);
          socket.once('connect_error', onError);
          
          console.log('[SocketUtils] Manually connecting socket...');
          socket.connect();
        });
      } catch (error) {
        console.error('[SocketUtils] Failed to connect socket:', error);
        throw error;
      }
    }
    
    console.log('[SocketUtils] Socket connected, sending call offer...');
    
    const response = await new Promise<void>((resolve, reject) => {
      // Set a timeout for the call offer
      const offerTimeout = setTimeout(() => {
        console.error('[SocketUtils] Call offer timeout');
        reject(new Error('Call offer timeout'));
      }, 30000); // 30 seconds for offer
      
      try {
        console.log('[SocketUtils] Emitting call_offer event with data:', {
          targetUserId,
          callType,
          hasOffer: !!offer,
          offerType: offer?.type
        });
        
        socket.emit('call_offer', {
          targetUserId,
          offer,
          callType,
        }, (response: { success: boolean; error?: string }) => {
          clearTimeout(offerTimeout);
          
          if (response?.success) {
            console.log('[SocketUtils] Call offer sent successfully');
            resolve();
          } else {
            const errorMsg = response?.error || 'Failed to send call offer';
            console.error('[SocketUtils] Call offer failed:', errorMsg);
            reject(new Error(errorMsg));
          }
        });
        
        // Log when the event is actually emitted
        console.log('[SocketUtils] call_offer event emitted, waiting for response...');
        
      } catch (error) {
        clearTimeout(offerTimeout);
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