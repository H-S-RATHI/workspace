/**
 * Shared types and interfaces for socket operations
 */
export type CallType = 'audio' | 'video';
export interface SocketStore {
  isConnected: boolean;
  socket: any;
  getState: () => SocketStore;
  answerCall: (callId: string, localDescription: RTCSessionDescriptionInit) => void;
  rejectCall: (callId: string) => void;
  endCall: (callId: string) => void;
}
export interface CallOfferResponse {
  success: boolean;
  error?: string;
}
export interface CallOfferData {
  callId: string;
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
  callType: CallType;
  timestamp: number;
}
export interface SocketState {
  connected: boolean;
  id: string;
  active: boolean;
  disconnected: boolean;
  isSocketIO: boolean;
  hasListeners: any;
  eventNames: any;
}
export interface DebugListeners {
  [eventName: string]: (...args: any[]) => void;
}
export type DebugEventType = 'connect' | 'disconnect' | 'error' | 'call_offer' | 'call_offer_response';