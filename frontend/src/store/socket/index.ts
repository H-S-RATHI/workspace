// Main store export
export { useSocketStore } from './store'
// Type exports
export type { 
  SocketState, 
  SocketActions, 
  SocketStore,
  UserStatusChangeEvent,
  TypingEvent,
  CallEvent,
  OnlineUsersEvent,
  ErrorEvent,
  MessageDeliveredEvent,
  MessageReadEvent,
  IceCandidateEvent,
  UserStoppedTypingEvent,
  Message
} from './types'
// Constants export
export { 
  INITIAL_SOCKET_STATE,
  SOCKET_CONFIG,
  SOCKET_EVENTS,
  MESSAGE_TYPES,
  CALL_TYPES 
} from './constants'
// Event handlers export (if needed for testing or customization)
export { 
  setupSocketEventHandlers,
  setupConnectionHandlers,
  setupPresenceHandlers,
  setupMessageHandlers,
  setupTypingHandlers,
  setupCallHandlers,
  setupErrorHandlers
} from './eventHandlers'