import type { CallStore } from './types';
import { useSocketStore } from '../socketStore';

export const createCallActions = (set: any, get: any) => ({
  initiateCall: async (targetUserId: string, callType: 'video' | 'audio') => {
    const { sendCallOffer } = useSocketStore.getState();
    try {
      // Get user media first to ensure permissions
      const constraints = {
        video: callType === 'video',
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Create peer connection and offer
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendCallOffer(targetUserId, offer, callType);
      set({
        activeCall: {
          callId: '', // Will be set when call is created on backend
          callType,
          status: 'RINGING',
          startedAt: new Date().toISOString(),
          isIncoming: false,
          otherParty: {
            userId: targetUserId,
            username: '',
            fullName: '',
            profilePhotoUrl: '',
          },
        },
        isCallModalOpen: true,
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  },
  endCall: () => {
    const { activeCall } = get();
    const { endCall: socketEndCall } = useSocketStore.getState();
    if (activeCall) {
      socketEndCall(activeCall.callId);
    }
    set({ activeCall: null, isCallModalOpen: false });
  },
  answerCall: () => {
    const { activeCall } = get();
    const { answerCall: socketAnswerCall } = useSocketStore.getState();
    if (activeCall) {
      socketAnswerCall(activeCall.callId, {});
      set({ activeCall: { ...activeCall, status: 'ACTIVE' } });
    }
  },
  rejectCall: () => {
    const { activeCall } = get();
    const { rejectCall: socketRejectCall } = useSocketStore.getState();
    if (activeCall) {
      socketRejectCall(activeCall.callId);
    }
    set({ activeCall: null, isCallModalOpen: false });
  },
}); 