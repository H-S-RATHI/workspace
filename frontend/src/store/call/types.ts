import type { Call } from '../../types/chat';

export interface CallState {
  activeCall: Call | null;
  isCallModalOpen: boolean;
}

export interface CallActions {
  initiateCall: (targetUserId: string, callType: 'video' | 'audio') => void;
  endCall: () => void;
  answerCall: () => void;
  rejectCall: () => void;
}

export type CallStore = CallState & CallActions; 