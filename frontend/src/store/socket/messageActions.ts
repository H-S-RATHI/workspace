import { SOCKET_EVENTS } from './constants';
import type { ActionCreator } from './types';
// ======================
// Message Management
// ======================
export const createMessageActions: ActionCreator = (_set, get) => ({
  sendMessage: (conversationId: string, message: string, messageType = 'TEXT') => {
    const { socket } = get()
    
    if (socket?.connected) {
      console.log('[SocketStore][sendMessage] Sending message:', {
        conversationId,
        messageType,
        messageLength: message.length
      });
      
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationId,
        message,
        messageType,
      })
    } else {
      console.warn('[SocketStore][sendMessage] Socket not connected, cannot send message:', {
        conversationId,
        messageType
      });
    }
  },
  
  startTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      console.log('[SocketStore][startTyping] Starting typing indicator:', { conversationId });
      socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId })
    } else {
      console.warn('[SocketStore][startTyping] Socket not connected, cannot start typing:', { conversationId });
    }
  },
  
  stopTyping: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      console.log('[SocketStore][stopTyping] Stopping typing indicator:', { conversationId });
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId })
    } else {
      console.warn('[SocketStore][stopTyping] Socket not connected, cannot stop typing:', { conversationId });
    }
  }
});