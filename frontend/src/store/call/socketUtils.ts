/**
 * Socket utilities - main entry point
 * 
 * This module provides a comprehensive set of utilities for socket operations,
 * including connection validation, call management, and WebRTC communication.
 */
// Export all types and interfaces
export * from './socketTypes';
// Export constants
export * from './socketConstants';
// Export validation utilities
export * from './socketValidations';
// Export call operations
export * from './callOperations';
// Re-export commonly used functions for convenience
export {
  validateSocketConnection,
  ensureSocketConnected,
} from './socketValidations';
export {
  sendCallOffer,
  sendCallAnswer,
  sendCallRejection,
  sendCallEnd,
} from './callOperations';
// Export types for convenience
export type {
  CallType,
  SocketStore,
  CallOfferResponse,
  CallOfferData,
  SocketState,
  DebugListeners,
  DebugEventType,
} from './socketTypes';