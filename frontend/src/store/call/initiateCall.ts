import { useSocketStore } from '../socketStore';
import { InitiateCallParams } from './types';
import { requestUserMedia, addTracksToConnection, logTransceivers, stopMediaStream } from './mediaUtils';
import { createPeerConnection, setupIceCandidateHandler, createOffer } from './peerConnectionUtils';
import { generateCallId, createCallData } from './callDataUtils';
import { validateSocketConnection, sendCallOffer } from './socketUtils';

export const createInitiateCallAction = (set: any, get: any) => {
  return async ({ targetUserId, callType }: InitiateCallParams): Promise<{ callId: string }> => {
    console.log('[CallStore][initiateCall] Starting call with:', { targetUserId, callType });
    console.log('[CallStore][initiateCall] Current call state:', get().activeCall);

    // Check if there's an active call already
    const currentCall = get().activeCall;
    if (currentCall) {
      console.log('[CallStore] Call already in progress, ending it first');
      await get().endCall(currentCall.callId);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for cleanup
    }

    // Validate socket connection
    validateSocketConnection(useSocketStore);

    let stream: MediaStream | null = null;
    let peerConnection: RTCPeerConnection | null = null;

    try {
      // Request user media permissions
      stream = await requestUserMedia(callType);

      // Create peer connection
      peerConnection = createPeerConnection();

      // Set up ICE candidate handling
      setupIceCandidateHandler(peerConnection, get, useSocketStore);

      // Add tracks to peer connection
      addTracksToConnection(peerConnection, stream);

      // Log transceivers for debugging
      logTransceivers(peerConnection);

      // Create and set local description
      const offer = await createOffer(peerConnection, callType);

      // Generate call ID
      const callId = generateCallId(targetUserId);

      // Store call details in the store
      const callData = createCallData(callId, callType, targetUserId, peerConnection, stream);

      console.log('[CallStore] Updating store with call data');
      set({
        activeCall: callData,
        isCallModalOpen: true,
        callStatus: 'RINGING'
      });

      // Send the offer to the other user
      if (peerConnection.localDescription) {
        await sendCallOffer(useSocketStore, targetUserId, peerConnection.localDescription, callType);
      } else {
        throw new Error('Failed to create local description');
      }

      console.log('[CallStore] Call offer sent successfully');
      return { callId };

      
    } catch (error) {
      console.error('Error initiating call:', error);
      
      // Clean up resources
      stopMediaStream(stream);
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
      
      throw error;
    }
  };
};