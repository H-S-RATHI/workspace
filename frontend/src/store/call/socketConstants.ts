/**
 * Constants for socket operations
 */
import { DebugEventType } from './socketTypes';
// Timeout configurations
export const SOCKET_TIMEOUTS = {
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  CALL_OFFER_TIMEOUT: 30000, // 30 seconds
} as const;
// Debug events for socket monitoring
export const DEBUG_EVENTS: DebugEventType[] = [
  'connect',
  'disconnect', 
  'error',
  'call_offer',
  'call_offer_response'
];
// Log prefixes for consistent logging
export const LOG_PREFIXES = {
  SOCKET_UTILS: '[SocketUtils]',
  EVENT: (eventName: string) => `[SocketUtils][event:${eventName}]`,
} as const;