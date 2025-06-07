import type { Socket } from 'socket.io-client'
import type { Message } from '../../types/chat'
// Socket Event Type Definitions
export interface UserStatusChangeEvent {
  userId: string;
  status: 'online' | 'offline';
}
export interface TypingEvent {
  userId: string;
  username: string;
  conversationId: string;
}
export interface CallEvent {
  callId: string;
  callerId?: string;
  callerUsername?: string;
  callType?: 'video' | 'audio';
  [key: string]: any;
}
export interface OnlineUsersEvent extends Array<string> {}
export interface ErrorEvent {
  message: string;
  [key: string]: any;
}
export interface MessageDeliveredEvent {
  messageId: string;
}
export interface MessageReadEvent {
  messageId: string;
}
export interface IceCandidateEvent {
  fromUserId: string;
  candidate: any;
}
export interface UserStoppedTypingEvent {
  userId: string;
  conversationId: string;
}
// Socket State Interface
export interface SocketState {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  typingUsers: Record<string, string[]> // conversationId -> userIds
}
// Socket Actions Interface
export interface SocketActions {
  connect: () => void
  disconnect: () => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, message: string, messageType?: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => void
  answerCall: (callId: string, answer: any) => void
  rejectCall: (callId: string) => void
  endCall: (callId: string) => void
  sendIceCandidate: (targetUserId: string, callId: string, candidate: RTCIceCandidate | null) => void
}
export interface SocketStore {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  typingUsers: Record<string, string[]> 
  connect: () => Promise<void>
  disconnect: () => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, message: string, messageType?: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  sendCallOffer: (targetUserId: string, offer: any, callType: 'video' | 'audio') => Promise<void>
  answerCall: (callId: string, answer: any) => void
  rejectCall: (callId: string) => void
  endCall: (callId: string) => void
  sendIceCandidate: (targetUserId: string, callId: string, candidate: RTCIceCandidate | null) => void
  emit: <T = any>(event: string, data: T) => void
}
// Define action types for better type safety
export type SetState = (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void;
export type GetState = () => SocketStore;
// Define the shape of the response from socket events
export interface SocketResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}
// Action creator types
export type ActionCreator = (set: SetState, get: GetState) => Record<string, any>;
export interface ActionCreators {
  createConnectionActions: ActionCreator;
  createConversationActions: ActionCreator;
  createMessageActions: ActionCreator;
  createCallActions: ActionCreator;
}
// Re-export Message type for convenience
export type { Message }