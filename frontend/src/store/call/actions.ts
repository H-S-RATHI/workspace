import { useSocketStore } from '../socketStore';

interface InitiateCallParams {
  targetUserId: string;
  callType: 'video' | 'audio';
}

import type { RTCSessionDescriptionInit } from './types';

interface CallActions {
  initiateCall: (params: InitiateCallParams) => Promise<{ callId: string }>;
  answerCall: (callId: string, answer: RTCSessionDescriptionInit) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
}

export const createCallActions = (set: any, get: any): CallActions => ({
  initiateCall: async ({ targetUserId, callType }): Promise<{ callId: string }> => {
    console.log('[CallStore] initiateCall called with:', { targetUserId, callType });
    
    // Get the current socket store state
    const socketStore = useSocketStore.getState();
    console.log('[CallStore] Socket store state:', { 
      isConnected: socketStore.isConnected, 
      socket: !!socketStore.socket 
    });
    
    if (!socketStore.isConnected || !socketStore.socket) {
      console.error('[CallStore] Cannot initiate call: WebSocket is not connected');
      throw new Error('WebSocket connection is not established');
    }
    
    // Get the socket instance
    const { socket } = socketStore;
    let stream: MediaStream | null = null;
    
    try {
      // Request user media permissions
      const constraints = {
        video: callType === 'video',
        audio: true,
      };
      console.log('[CallStore] Requesting media with constraints:', constraints);
      
      try {
        // Get user media stream
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('[CallStore] Successfully acquired media stream');
      } catch (mediaError) {
        console.error('[CallStore] Error getting user media:', mediaError);
        throw new Error('Could not access camera/microphone. Please check your permissions.');
      }
      
      // Create peer connection
      console.log('[CallStore] Creating RTCPeerConnection');
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      
      // Add event listeners for ICE candidates
      peerConnection.onicecandidate = (event) => {
        console.log('[CallStore] ICE candidate:', event.candidate);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log('[CallStore] ICE connection state:', peerConnection.iceConnectionState);
      };
      
      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log(`[CallStore] Adding track to peer connection: ${track.kind}`);
        peerConnection.addTrack(track, stream!);
      });
      
      // Create and set local description
      console.log('[CallStore] Creating offer');
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      
      console.log('[CallStore] Setting local description');
      await peerConnection.setLocalDescription(offer);
      
      // Generate a temporary call ID
      const callId = `${Date.now()}-${targetUserId}`;
      console.log('[CallStore] Generated call ID:', callId);
      
      // Store call details in the store
      const callData = {
        callId,
        callType,
        status: 'RINGING',
        startedAt: new Date().toISOString(),
        isIncoming: false,
        peerConnection,
        localStream: stream,
        remoteStream: null,
        otherParty: {
          userId: targetUserId,
          username: '',
          fullName: `User ${targetUserId.slice(0, 6)}`,
          profilePhotoUrl: '',
        },
      };
      
      console.log('[CallStore] Updating store with call data');
      set({
        activeCall: callData,
        isCallModalOpen: true,
      });
      
      // Send the offer to the other user
      console.log('[CallStore] Sending call offer to peer:', targetUserId);
      
      // Emit the call offer event
      socket.emit('call:offer', {
        to: targetUserId,
        offer: peerConnection.localDescription,
        callType,
        callId
      });
      
      console.log('[CallStore] Call offer sent successfully');
      return { callId };
      
    } catch (error) {
      console.error('Error initiating call:', error);
      
      // Clean up resources
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
      
      throw error;
    }
  },
  
  answerCall: async (callId: string, answer: RTCSessionDescriptionInit) => {
    console.log('[CallStore] answerCall called with:', { callId });
    
    const { activeCall } = get();
    if (!activeCall || activeCall.callId !== callId) {
      console.error('[CallStore] No active call found with ID:', callId);
      return;
    }
    
    const socketStore = useSocketStore.getState();
    if (!socketStore.socket) {
      console.error('[CallStore] Cannot answer call: WebSocket is not connected');
      throw new Error('WebSocket connection is not established');
    }
    
    const { socket } = socketStore;
    const peerConnection = activeCall.peerConnection;
    
    if (!peerConnection) {
      console.error('[CallStore] No peer connection found for call:', callId);
      return;
    }
    
    try {
      console.log('[CallStore] Setting remote description with answer');
      // Create a native RTCSessionDescription from the answer
      const sessionDescription = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(sessionDescription);
      
      // Send the answer back to the caller
      console.log('[CallStore] Sending answer to caller');
      socket.emit('call:answer', {
        to: activeCall.otherParty.userId,
        callId,
        answer: peerConnection.localDescription
      });
      
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
      if (activeCall.localStream) {
        activeCall.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
      
      throw error;
    }
  },
  
  rejectCall: (callId: string) => {
    console.log('[CallStore] rejectCall called with:', { callId });
    
    const { activeCall } = get();
    if (!activeCall || activeCall.callId !== callId) {
      console.error('[CallStore] No active call found with ID:', callId);
      return;
    }
    
    const socketStore = useSocketStore.getState();
    if (socketStore.socket) {
      console.log('[CallStore] Sending call:reject event');
      socketStore.socket.emit('call:reject', {
        callId,
        to: activeCall.otherParty.userId
      });
    } else {
      console.warn('[CallStore] Socket not available, cannot send call:reject event');
    }
    
    // Clean up resources
    if (activeCall.localStream) {
      activeCall.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    // Close peer connection if it exists
    if (activeCall.peerConnection) {
      console.log('[CallStore] Closing peer connection in rejectCall');
      activeCall.peerConnection.close();
    }

    // Reset call state
    set({
      activeCall: null,
      isCallModalOpen: false,
    });
  },
  
  endCall: async () => {
    console.log('[CallStore] endCall called');
    
    const { activeCall } = get();
    if (!activeCall) {
      console.error('[CallStore] No active call found');
      return;
    }
    
    try {
      // Close peer connection if it exists
      if (activeCall.peerConnection) {
        console.log('[CallStore] Closing peer connection in endCall');
        activeCall.peerConnection.close();
      }

      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
    } catch (error) {
      console.error('Error ending call:', error);
      // Still reset the state even if there was an error
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
      throw error;
    }
  },
});
