import { CallData } from './types';
/**
 * Utility functions for managing call data and state
 */
export const generateCallId = (targetUserId: string): string => {
  const callId = `${Date.now()}-${targetUserId}`;
  console.log('[CallDataUtils] Generated call ID:', callId);
  return callId;
};
export const createCallData = (
  callId: string,
  callType: 'video' | 'audio',
  targetUserId: string,
  peerConnection: RTCPeerConnection,
  localStream: MediaStream,
  isIncoming: boolean = false
): CallData => {
  return {
    callId,
    callType,
    status: 'RINGING',
    startedAt: new Date().toISOString(),
    isIncoming,
    peerConnection,
    localStream,
    remoteStream: null,
    otherParty: {
      userId: targetUserId,
      username: '',
      fullName: `User ${targetUserId.slice(0, 6)}`,
      profilePhotoUrl: '',
    },
  };
};
export const validateActiveCall = (activeCall: CallData | null, callId: string): boolean => {
  if (!activeCall || activeCall.callId !== callId) {
    console.error('[CallDataUtils] No active call found with ID:', callId);
    return false;
  }
  return true;
};
export const cleanupCallResources = (callData: CallData): void => {
  // Stop all media tracks
  if (callData.localStream) {
    callData.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }
  
  if (callData.remoteStream) {
    callData.remoteStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }
  // Close peer connection
  if (callData.peerConnection) {
    console.log('[CallDataUtils] Closing peer connection during cleanup');
    callData.peerConnection.close();
  }
};
export const clearCallTimeouts = (get: any, set: any, callId: string): void => {
  const { callTimeouts } = get() as any;
  if (callTimeouts && callTimeouts[callId]) {
    clearTimeout(callTimeouts[callId]);
    const newTimeouts = { ...callTimeouts };
    delete newTimeouts[callId];
    set({ callTimeouts: newTimeouts } as any);
  }
};