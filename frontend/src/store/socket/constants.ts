import type { SocketState } from './types'
export const INITIAL_SOCKET_STATE: SocketState = {
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: {},
}
export const SOCKET_CONFIG = {
  TRANSPORTS: ['websocket', 'polling'],
  PATH: '/socket.io/',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 20000,
  CLIENT_VERSION: '1.0.0'
} as const
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // User presence events
  ONLINE_USERS: 'online_users',
  USER_STATUS_CHANGE: 'user_status_change',
  
  // Message events
  NEW_MESSAGE: 'new_message',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  SEND_MESSAGE: 'send_message',
  
  // Typing events
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Conversation events
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  
  // Call events
  INCOMING_CALL: 'incoming_call',
  CALL_ANSWERED: 'call_answered',
  CALL_REJECTED: 'call_rejected',
  CALL_ENDED: 'call_ended',
  CALL_OFFER: 'call_offer',
  CALL_ANSWER: 'call_answer',
  CALL_REJECT: 'call_reject',
  CALL_END: 'call_end',
  ICE_CANDIDATE: 'ice_candidate',
  
  // Error events
  ERROR: 'error'
} as const
export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VOICE: 'VOICE',
  LOCATION: 'LOCATION',
  PAYMENT: 'PAYMENT'
} as const
export const CALL_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio'
} as const