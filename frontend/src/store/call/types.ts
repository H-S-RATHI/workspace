import type { RTCSessionDescription as NativeRTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

// Define a type for the session description that comes over the wire
export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

// Use the native RTCSessionDescription type directly
export type RTCSessionDescription = NativeRTCSessionDescription;

export type CallType = 'audio' | 'video';

export enum CALL_STATUS {
  IDLE = 'IDLE',
  RINGING = 'RINGING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  FAILED = 'FAILED',
}

export interface CallUser {
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl: string;
}

export type CallStatus = 'IDLE' | 'RINGING' | 'ACTIVE' | 'ENDED' | 'FAILED';

export interface Call {
  callId: string;
  callType: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt?: string;
  isIncoming: boolean;
  peerConnection?: RTCPeerConnection;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  otherParty: CallUser;
}

export interface CallState {
  activeCall: Call | null;
  isCallModalOpen: boolean;
  callStatus: CallStatus;
}

export interface CallActions {
  initiateCall: (params: { targetUserId: string; callType: CallType }) => Promise<{ callId: string }>;
  answerCall: (callId: string, answer: RTCSessionDescriptionInit) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
  setCallModalOpen: (isOpen: boolean) => void;
  handleIncomingCall: (data: {
    callId: string;
    callerId: string;
    callerUsername: string;
    callType: CallType;
    offer: RTCSessionDescriptionInit;
  }) => Promise<void>;
}

export interface IceCandidateEvent {
  fromUserId: string;
  callId: string;
  candidate: RTCIceCandidate;
}

export interface CallEvent {
  callId: string;
  callerId: string;
  callerUsername: string;
  callType: CallType;
  offer?: RTCSessionDescription;
  answer?: RTCSessionDescription;
}

export interface InitiateCallParams {
  targetUserId: string;
  callType: 'video' | 'audio';
}
export interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp?: string;
}
export interface CallActions {
  initiateCall: (params: InitiateCallParams) => Promise<{ callId: string }>;
  answerCall: (callId: string, answer: RTCSessionDescriptionInit) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
}
export interface CallData {
  callId: string;
  callType: 'video' | 'audio';
  status: 'RINGING' | 'ACTIVE' | 'IDLE' | 'FAILED';
  startedAt: string;
  isIncoming: boolean;
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  otherParty: {
    userId: string;
    username: string;
    fullName: string;
    profilePhotoUrl: string;
  };
}

export type CallStore = CallState & CallActions;