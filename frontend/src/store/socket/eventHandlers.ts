import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import type { 
  SocketStore,
  UserStatusChangeEvent,
  TypingEvent,
  CallEvent,
  OnlineUsersEvent,
  ErrorEvent,
  Message,
  MessageDeliveredEvent,
  MessageReadEvent,
  IceCandidateEvent,
  UserStoppedTypingEvent
} from './types'
import { SOCKET_EVENTS } from './constants'
import { useChatStore } from '../chatStore'
import { useAuthStore } from '../authStore'
// Connection Event Handlers
export const setupConnectionHandlers = (
  socket: Socket, 
  set: (partial: Partial<SocketStore>) => void
) => {
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('Socket connected:', socket.id)
    set({ isConnected: true })
  })
  socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
    console.log('Socket disconnected:', reason)
    set({ isConnected: false })
  })
  socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
    console.error('Socket connection error:', error)
    toast.error('Connection failed')
  })
}
// User Presence Event Handlers
export const setupPresenceHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void,
  get: () => SocketStore
) => {
  socket.on(SOCKET_EVENTS.ONLINE_USERS, (users: OnlineUsersEvent) => {
    set({ onlineUsers: users })
  })
  socket.on(SOCKET_EVENTS.USER_STATUS_CHANGE, ({ userId, status }: UserStatusChangeEvent) => {
    const { onlineUsers } = get()
    if (status === 'online') {
      set({ onlineUsers: [...onlineUsers.filter(id => id !== userId), userId] })
    } else {
      set({ onlineUsers: onlineUsers.filter(id => id !== userId) })
    }
  })
}
// Message Event Handlers
export const setupMessageHandlers = (socket: Socket) => {
  socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: Message) => {
    const chatStore = useChatStore.getState();
    const { currentConversation } = chatStore;
    const currentUser = useAuthStore.getState().user;
    
    // Skip if this is our own message (already added to UI when sent)
    if (message.senderId === currentUser?.userId) {
      console.log('Skipping own message from socket:', message.messageId);
      return;
    }
    
    // Only process if this is for the current conversation
    if (currentConversation && message.convoId === currentConversation.convoId) {
      console.log('Adding new message from other user:', message);
      useChatStore.setState((state) => {
        // Check if message already exists to prevent duplicates
        const messageExists = state.messages.some(m => 
          m.messageId === message.messageId || 
          (m.timestamp === message.timestamp && m.senderId === message.senderId)
        );
        
        if (messageExists) {
          console.log('Message already exists, skipping:', message.messageId);
          return state;
        }
        
        return {
          messages: [...state.messages, message],
          conversations: state.conversations.map(conv =>
            conv.convoId === currentConversation.convoId
              ? { ...conv, lastMessage: message, lastMessageAt: message.timestamp }
              : conv
          ).sort((a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
        };
      });
    } else {
      console.log('Message received for different conversation:', message.convoId);
    }
  })
  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, ({ messageId }: MessageDeliveredEvent) => {
    console.log('Message delivered:', messageId)
  })
  socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ messageId }: MessageReadEvent) => {
    console.log('Message read:', messageId)
  })
}
// Typing Event Handlers
export const setupTypingHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void,
  get: () => SocketStore
) => {
  socket.on(SOCKET_EVENTS.USER_TYPING, ({ userId, username: _username, conversationId }: TypingEvent) => {
    const { typingUsers } = get()
    const currentTyping = typingUsers[conversationId] || []
    
    if (!currentTyping.includes(userId)) {
      set({
        typingUsers: {
          ...typingUsers,
          [conversationId]: [...currentTyping, userId],
        },
      })
    }
  })
  socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, ({ userId, conversationId }: UserStoppedTypingEvent) => {
    const { typingUsers } = get()
    const currentTyping = typingUsers[conversationId] || []
    
    set({
      typingUsers: {
        ...typingUsers,
        [conversationId]: currentTyping.filter(id => id !== userId),
      },
    })
  })
}
// Call Event Handlers
export const setupCallHandlers = (socket: Socket) => {
  // Handle incoming calls
  socket.on(SOCKET_EVENTS.INCOMING_CALL, async (data: CallEvent) => {
    try {
      const { callId, callerId, callerUsername, callType, offer } = data;
      console.log('[Socket] Incoming call:', { callId, callerId, callerUsername, callType });
      
      // Import the call store dynamically to avoid circular dependencies
      const { useCallStore } = await import('../../store/call/store');
      const callStore = useCallStore.getState();
      
      await callStore.handleIncomingCall({
        callId,
        callerId,
        callerUsername,
        callType,
        offer
      });
      
      console.log('[Socket] Successfully handled incoming call');
    } catch (error) {
      console.error('[Socket] Error handling incoming call:', error);
    }
  });
  
  // Handle call answered
  socket.on(SOCKET_EVENTS.CALL_ANSWERED, async (data: CallEvent & { answer: RTCSessionDescriptionInit }) => {
    try {
      console.log('[Socket] Call answered:', data.callId);
      const { useCallStore } = await import('../../store/call/store');
      const callStore = useCallStore.getState();
      
      await callStore.answerCall(data.callId, data.answer);
      console.log('[Socket] Successfully handled call answer');
    } catch (error) {
      console.error('[Socket] Error handling call answer:', error);
    }
  });
  
  // Handle call rejected
  socket.on(SOCKET_EVENTS.CALL_REJECTED, async (data: CallEvent) => {
    try {
      console.log('[Socket] Call rejected:', data.callId);
      toast.error('Call was rejected');
      
      const { useCallStore } = await import('../../store/call/store');
      const callStore = useCallStore.getState();
      
      callStore.endCall(data.callId);
      console.log('[Socket] Successfully handled call rejection');
    } catch (error) {
      console.error('[Socket] Error handling call rejection:', error);
    }
  });
  
  // Handle call ended
  socket.on(SOCKET_EVENTS.CALL_ENDED, async (data: CallEvent) => {
    try {
      console.log('[Socket] Call ended:', data.callId);
      
      const { useCallStore } = await import('../../store/call/store');
      const callStore = useCallStore.getState();
      
      callStore.endCall(data.callId);
      console.log('[Socket] Successfully handled call end');
    } catch (error) {
      console.error('[Socket] Error handling call end:', error);
    }
  });
  
  // Handle ICE candidates
  socket.on(SOCKET_EVENTS.ICE_CANDIDATE, async (data: IceCandidateEvent) => {
    try {
      console.log('[Socket] ICE candidate received from:', data.fromUserId);
      
      const { useCallStore } = await import('../../store/call/store');
      const callStore = useCallStore.getState();
      const { activeCall } = callStore;
      
      if (activeCall?.peerConnection && data.candidate) {
        console.log('[Socket] Adding ICE candidate to peer connection');
        await activeCall.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('[Socket] Successfully added ICE candidate');
      } else {
        console.warn('[Socket] No active call or peer connection to add ICE candidate to');
      }
    } catch (error) {
      console.error('[Socket] Error adding ICE candidate:', error);
    }
  });
  
  // Handle call state sync (if needed)
  socket.on('call_state_sync', (data: { callId: string, state: any }) => {
    console.log('[Socket] Call state sync:', data.callId, data.state);
    // Implement any necessary call state synchronization logic here
  });
}
// Error Event Handlers
export const setupErrorHandlers = (socket: Socket) => {
  socket.on(SOCKET_EVENTS.ERROR, (data: ErrorEvent) => {
    toast.error(data.message)
  })
}
// Main setup function that combines all handlers
export const setupSocketEventHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore> | ((state: SocketStore) => Partial<SocketStore>)) => void,
  get: () => SocketStore
) => {
  console.log('Socket instance created, setting up event listeners...')
  
  setupConnectionHandlers(socket, set)
  setupPresenceHandlers(socket, set, get)
  setupMessageHandlers(socket)
  setupTypingHandlers(socket, set, get)
  setupCallHandlers(socket)
  setupErrorHandlers(socket)
}