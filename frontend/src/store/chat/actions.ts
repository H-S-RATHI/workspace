import { chatAPI, usersAPI } from '../../services/api'
import { useSocketStore } from '../socketStore'
import { useAuthStore } from '../authStore'
import type { 
  ChatStore, 
  CreateConversationData, 
  Message
} from './types'
import { INITIAL_CHAT_STATE, PAGINATION_CONFIG } from './constants'
// Conversation Management Actions
export const createConversationActions = (
  set: (partial: Partial<ChatStore> | ((state: ChatStore) => Partial<ChatStore>)) => void,
  get: () => ChatStore
) => ({
  // Fetch all conversations for the current user with optimized error handling
  fetchConversations: async (options: { force?: boolean } = {}) => {
    const { force = false } = options;
    const state = get();
    
    // Skip if already loading
    if (state.isLoading && !force) {
      return;
    }
    
    // Skip if we've fetched recently and it's not a forced refresh
    const now = Date.now();
    if (!force && state.lastFetchTime && (now - state.lastFetchTime < 30000)) {
      return;
    }
    
    try {
      set({
        isLoading: true,
        error: null,
        lastFetchAttempt: now
      });
      
      const response = await chatAPI.getConversations();
      
      if (response?.success) {
        set({
          conversations: response.conversations,
          lastFetchTime: now,
          lastFetchSuccess: true,
          isLoading: false,
          error: null
        });
        return response.conversations;
      }
      
      throw new Error('Failed to load conversations');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load conversations';
      console.error('Error fetching conversations:', error);
      
      set({
        error: errorMessage,
        lastFetchSuccess: false,
        isLoading: false
      });
      
      // Re-throw to allow components to handle the error if needed
      throw error;
    }
  },
  // Create a new conversation
  createConversation: async (data: CreateConversationData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await chatAPI.createConversation(data)
      if (response.success) {
        // Add the new conversation to the list
        set(state => ({
          conversations: [response.conversation, ...state.conversations],
          currentConversation: response.conversation
        }))
        return response.conversation
      }
      return null
    } catch (error: any) {
      set({ error: error.message || 'Failed to create conversation' })
      console.error('Error creating conversation:', error)
      return null
    } finally {
      set({ isLoading: false })
    }
  },
  // Select a conversation and load its messages
  selectConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null })
    try {
      // Find the conversation in the list
      const conversation = get().conversations.find(c => c.convoId === conversationId)
      if (conversation) {
        set({ currentConversation: conversation })
        
        // Join the conversation room for real-time updates
        const socket = useSocketStore.getState().socket
        if (socket) {
          socket.emit('join_conversation', { conversationId })
        }
        
        // Load messages
        const response = await chatAPI.getMessages(conversationId)
        if (response.success) {
          set({ messages: response.messages })
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load conversation' })
      console.error('Error selecting conversation:', error)
    } finally {
      set({ isLoading: false })
    }
  }
})
// Message Management Actions
export const createMessageActions = (
  set: (partial: Partial<ChatStore> | ((state: ChatStore) => Partial<ChatStore>)) => void,
  get: () => ChatStore
) => ({
  // Send a message in the current conversation
  sendMessage: async (
    content: string, 
    messageType: 'TEXT' | 'IMAGE' | 'VOICE' | 'LOCATION' | 'PAYMENT' = 'TEXT'
  ) => {
    const { currentConversation } = get()
    if (!currentConversation) return
    
    set({ isSending: true, error: null })
    
    // Get current user from auth store
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Create temp message outside try block to make it accessible in catch
    const tempMessage: Message = {
      messageId: `temp-${Date.now()}`,
      convoId: currentConversation.convoId,
      senderId: currentUser.userId,
      senderUsername: currentUser.username || 'You',
      msgType: messageType as any,
      contentText: content,
      timestamp: new Date().toISOString(),
      status: 'SENT' as const
    }
    
    try {
      const socket = useSocketStore.getState().socket
      // Message data will be sent via socket
      // The socket.emit call below uses content and messageType directly
      
      // Add the temp message to the UI
      set(state => ({
        messages: [...state.messages, tempMessage],
        conversations: state.conversations.map(conv => 
          conv.convoId === currentConversation.convoId 
            ? { ...conv, lastMessage: tempMessage, lastMessageAt: tempMessage.timestamp }
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      }))
      
      // Send the message via WebSocket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          conversationId: currentConversation.convoId,
          message: content,
          messageType
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Failed to send message'
      
      set({ error: errorMessage })
      console.error('Error sending message:', error)
    } finally {
      set({ isSending: false })
    }
  },
  // Load more messages for the current conversation (pagination)
  loadMoreMessages: async () => {
    const { currentConversation, messages } = get()
    if (!currentConversation || messages.length === 0) return
    
    set({ isLoading: true })
    
    try {
      const response = await chatAPI.getMessages(
        currentConversation.convoId, 
        Math.floor(messages.length / PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) + 1, // page number
        PAGINATION_CONFIG.DEFAULT_PAGE_SIZE // limit
      )
      
      if (response.success && response.messages.length > 0) {
        set(state => ({
          messages: [...response.messages, ...state.messages],
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
      set({ isLoading: false })
    }
  }
})
// Search Actions
export const createSearchActions = () => ({
  // Search for users to start a new chat
  searchUsers: async (query: string) => {
    try {
      const response = await usersAPI.searchUsers(query)
      if (response.success) {
        return response.users
      }
      return []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }
})
// Utility Actions
export const createUtilityActions = (
  set: (partial: Partial<ChatStore> | ((state: ChatStore) => Partial<ChatStore>)) => void
) => ({
  // Reset the store
  reset: () => set(INITIAL_CHAT_STATE)
})