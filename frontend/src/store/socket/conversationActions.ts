import { SOCKET_EVENTS } from './constants';
import type { ActionCreator } from './types';
// ======================
// Conversation Management
// ======================
export const createConversationActions: ActionCreator = (_set, get) => ({
  joinConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      console.log('[SocketStore][joinConversation] Joining conversation:', { conversationId });
      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId })
    } else {
      console.warn('[SocketStore][joinConversation] Socket not connected, cannot join conversation:', { conversationId });
    }
  },
  
  leaveConversation: (conversationId: string) => {
    const { socket } = get()
    
    if (socket?.connected) {
      console.log('[SocketStore][leaveConversation] Leaving conversation:', { conversationId });
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId })
    } else {
      console.warn('[SocketStore][leaveConversation] Socket not connected, cannot leave conversation:', { conversationId });
    }
  }
});