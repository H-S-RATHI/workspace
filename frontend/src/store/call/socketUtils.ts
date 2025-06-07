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
  export const sendCallOffer = (
    useSocketStore: any,
    targetUserId: string,
    localDescription: RTCSessionDescriptionInit,
    callType: 'video' | 'audio'
  ): void => {
    console.log('[SocketUtils] Sending call offer to peer:', targetUserId);
    
    const { sendCallOffer } = useSocketStore.getState();
    sendCallOffer(targetUserId, localDescription, callType);
    
    console.log('[SocketUtils] Call offer sent successfully');
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