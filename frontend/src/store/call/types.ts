import type { Call } from '../../types/chat';

export interface CallState {
  activeCall: Call | null;
  isCallModalOpen: boolean;
}

export interface CallActions {
  initiateCall: (params: { targetUserId: string; callType: 'video' | 'audio' }) => Promise<{ callId: string }>;
  endCall: (callId: string) => void;
  answerCall: (callId: string, answer: any) => void;
  rejectCall: (callId: string) => void;
  setCallModalOpen: (isOpen: boolean) => void;
}

export type CallStore = CallState & CallActions;