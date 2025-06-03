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
export const setupMessageHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore>) => void
) => {
  socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: Message) => {
    // Update chat store if the message belongs to the current conversation
    const chatStore = useChatStore.getState();
    const { currentConversation, messages } = chatStore;
    if (currentConversation && message.convoId === currentConversation.convoId) {
      useChatStore.setState((state) => ({
        messages: [...state.messages, message],
        conversations: state.conversations.map(conv =>
          conv.convoId === currentConversation.convoId
            ? { ...conv, lastMessage: message, lastMessageAt: message.timestamp }
            : conv
        ).sort((a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      }));
    }
    // Optionally, update conversation list for other conversations if needed
    console.log('New message received:', message)
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
export const setupCallHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore>) => void
) => {
  socket.on(SOCKET_EVENTS.INCOMING_CALL, (data: CallEvent) => {
    const { callId, callerId, callerUsername, callType } = data
    console.log('Incoming call:', { callId, callerId, callerUsername, callType })
    // This will be handled by the call store or components
  })
  socket.on(SOCKET_EVENTS.CALL_ANSWERED, (data: CallEvent) => {
    console.log('Call answered:', data.callId)
  })
  socket.on(SOCKET_EVENTS.CALL_REJECTED, (data: CallEvent) => {
    console.log('Call rejected:', data.callId)
    toast.error('Call was rejected')
  })
  socket.on(SOCKET_EVENTS.CALL_ENDED, (data: CallEvent) => {
    console.log('Call ended:', data.callId)
  })
  socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data: IceCandidateEvent) => {
    console.log('ICE candidate received from:', data.fromUserId)
  })
}
// Error Event Handlers
export const setupErrorHandlers = (
  socket: Socket,
  set: (partial: Partial<SocketStore>) => void
) => {
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
  setupMessageHandlers(socket, set)
  setupTypingHandlers(socket, set, get)
  setupCallHandlers(socket, set)
  setupErrorHandlers(socket, set)
}