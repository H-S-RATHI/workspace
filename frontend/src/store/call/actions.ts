import { useSocketStore } from '../socketStore';

interface InitiateCallParams {
  targetUserId: string;
  callType: 'video' | 'audio';
}

interface CallActions {
  initiateCall: (params: InitiateCallParams) => Promise<{ callId: string }>;
  answerCall: (callId: string, answer: any) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
}

export const createCallActions = (set: any, get: any): CallActions => ({
  initiateCall: async ({ targetUserId, callType }): Promise<{ callId: string }> => {
    const { sendCallOffer } = useSocketStore.getState();
    let stream: MediaStream | null = null;
    
    try {
      // Request user media permissions
      const constraints = {
        video: callType === 'video',
        audio: true,
      };
      
      // Get user media stream
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      
      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream!);
      });
      
      // Create and set local description
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      
      await peerConnection.setLocalDescription(offer);
      
      // Generate a temporary call ID
      const callId = `${Date.now()}-${targetUserId}`;
      
      // Store call details in the store
      set({
        activeCall: {
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
        },
        isCallModalOpen: true,
      });
      
      // Send the offer to the other user
      sendCallOffer(targetUserId, offer, callType);
      
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
  
  answerCall: (callId: string, answer: RTCSessionDescriptionInit) => {
    const { socket } = useSocketStore.getState();
    const { activeCall } = get();
    
    if (!socket?.connected || !activeCall?.peerConnection) {
      console.error('Cannot answer call: No active connection or peer connection');
      return;
    }
    
    try {
      // Set remote description with the answer
      activeCall.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      
      // Update call status
      set({
        activeCall: {
          ...activeCall,
          status: 'ACTIVE',
        },
      });
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  },
  
  rejectCall: (callId: string) => {
    const { socket } = useSocketStore.getState();
    const { activeCall } = get();
    
    try {
      if (socket?.connected) {
        socket.emit('call:reject', { callId });
      }
      
      // Clean up resources
      if (activeCall?.localStream) {
        activeCall.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      
      // Reset call state
      set({
        activeCall: null,
        isCallModalOpen: false,
      });
    } catch (error) {
      console.error('Error rejecting call:', error);
      throw error;
    }
  },
  
  endCall: (callId: string) => {
    const { socket } = useSocketStore.getState();
    const { activeCall } = get();
    
    try {
      if (socket?.connected) {
        socket.emit('call:end', { callId });
      }
      
      // Clean up resources
      if (activeCall?.localStream) {
        activeCall.localStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          activeCall.localStream?.removeTrack(track);
        });
      }
      
      if (activeCall?.remoteStream) {
        activeCall.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          activeCall.remoteStream?.removeTrack(track);
        });
      }
      
      if (activeCall?.peerConnection) {
        // Remove all event listeners before closing
        activeCall.peerConnection.ontrack = null;
        activeCall.peerConnection.onicecandidate = null;
        activeCall.peerConnection.oniceconnectionstatechange = null;
        activeCall.peerConnection.onsignalingstatechange = null;
        activeCall.peerConnection.onicegatheringstatechange = null;
        activeCall.peerConnection.onnegotiationneeded = null;
        
        // Close the peer connection
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
