import { useSocketStore } from '../socketStore';
import { RTCSessionDescriptionInit } from './types';
import { stopMediaStream } from './mediaUtils';
import { setRemoteAnswer, setupIceCandidateHandler } from './peerConnectionUtils';
import { validateActiveCall } from './callDataUtils';
import { sendCallAnswer } from './socketUtils';
export const createAnswerCallAction = (set: any, get: any) => {
  return async (callId: string, answer: RTCSessionDescriptionInit): Promise<void> => {
    console.log('[CallStore] answerCall called with:', { callId });
    
    const { activeCall } = get();
    if (!validateActiveCall(activeCall, callId)) {
      return;
    }
    
    const socketStore = useSocketStore.getState();
    if (!socketStore.socket) {
      console.error('[CallStore] Cannot answer call: WebSocket is not connected');
      throw new Error('WebSocket connection is not established');
    }
    
    const peerConnection = activeCall.peerConnection;
    
    if (!peerConnection) {
      console.error('[CallStore] No peer connection found for call:', callId);
      return;
    }
    
    try {
      // Set remote description with the answer
      await setRemoteAnswer(peerConnection, answer);
      
      // Send the answer back to the caller
      if (peerConnection.localDescription) {
        sendCallAnswer(useSocketStore, callId, peerConnection.localDescription);
      } else {
        throw new Error('Failed to create local description');
      }
      
      // Set up ICE candidate handling for the answerer
      setupIceCandidateHandler(peerConnection, get, useSocketStore);
      
      console.log('[CallStore] Call answered successfully');
      
      set({
        activeCall: {
          ...activeCall,
          status: 'ACTIVE' as const,
        },
      });
    } catch (error) {
      console.error('[CallStore] Error answering call:', error);
      
      // Clean up resources
      stopMediaStream(activeCall.localStream);
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
      
      throw error;
    }
  };
};