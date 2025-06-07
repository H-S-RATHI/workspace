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
      if (!socket || !socket.connected) {
        throw new Error('Socket not connected');
      }
      
      // Add a timeout to the call offer
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Call offer timeout')), 10000)
      );
      
      // Race the socket emit against the timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          socket.emit('call:offer', {
            targetUserId,
            offer,
            callType,
          }, (response: { success: boolean }) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error('Failed to send call offer'));
            }
          });
        }),
        timeout
      ]);
      
      console.log('[SocketUtils] Call offer sent successfully');
    } catch (error) {
      console.error('[SocketUtils] Error sending call offer:', error);
      throw error;
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