import { chatAPI, usersAPI } from '../../services/api'
import { useSocketStore } from '../socketStore'
import { useAuthStore } from '../authStore'
import { getStoredMessages, saveMessages } from '../../utils/storage'
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
  selectConversation: async (conversationId: string, forceReload = false) => {
    const state = get();
    
    // If already selected and not forcing a reload, do nothing
    if (!forceReload && state.currentConversation?.convoId === conversationId) {
      return;
    }
    
    set({ 
      isLoading: true, 
      error: null, 
      hasMoreMessages: true,
      messages: [], // Clear existing messages when switching conversations
      currentPage: 1
    });
    
    try {
      // Find the conversation in the list
      const conversation = state.conversations.find(c => c.convoId === conversationId);
      if (conversation) {
        // First, try to load messages from localStorage
        const storedMessages = getStoredMessages(conversationId);
        
        set({ 
          currentConversation: conversation,
          messages: storedMessages, // Load messages from localStorage
          currentPage: 1,
          hasMoreMessages: true,
          isLoading: false
        });
        
        // Join the conversation room for real-time updates
        const socket = useSocketStore.getState().socket;
        if (socket) {
          socket.emit('join_conversation', { conversationId });
        }
        
        // Always fetch fresh messages in the background
        try {
          const response = await chatAPI.getMessages(conversationId, 1, 20);
          if (response.success && response.messages.length > 0) {
            // Only update if we got new messages
            set(() => ({
              messages: response.messages,
              currentPage: 1,
              hasMoreMessages: response.messages.length === 20
            }));
            // Save the fresh messages to localStorage
            saveMessages(conversationId, response.messages);
          }
        } catch (error) {
          console.error('Error fetching fresh messages:', error);
          // Don't show error to user, we already have cached messages
        }
      }
    } catch (error: any) {
      console.error('Error in selectConversation:', error);
      set({
        error: error.message || 'Failed to load conversation',
        hasMoreMessages: false,
        isLoading: false
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Load more messages with pagination
  loadMoreMessages: async () => {
    const { currentConversation, currentPage, isLoading, hasMoreMessages } = get();
    
    // Don't load more if already loading, no more messages, or no conversation selected
    if (isLoading || !hasMoreMessages || !currentConversation) return;
    
    set({ isFetchingMore: true });
    
    try {
      const response = await chatAPI.getMessages(currentConversation.convoId, currentPage, 20);
      
      if (response.success) {
        set(state => {
          if (!state.currentConversation) return state;
          
          const existingMessageIds = new Set(state.messages.map(m => m.messageId));
          const newMessages = response.messages.filter(msg => !existingMessageIds.has(msg.messageId));
          
          // If no new messages, we've reached the end
          if (newMessages.length === 0) {
            return { 
              hasMoreMessages: false,
              isFetchingMore: false
            };
          }
          
          // Combine and sort messages by timestamp
          const allMessages = [...state.messages, ...newMessages].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          return {
            messages: allMessages,
            currentPage: state.currentPage + 1,
            hasMoreMessages: newMessages.length === 20, // Assume more if we got a full page
            isFetchingMore: false
          };
        });
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      set({ 
        error: 'Failed to load more messages',
        isFetchingMore: false 
      });
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
    const { currentConversation, messages } = get()
    if (!currentConversation) return
    
    set({ isSending: true, error: null })
    
    // Get current user from auth store
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Create temp message outside try block to make it accessible in catch
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      messageId: `temp-${Date.now()}`,
      convoId: currentConversation.convoId,
      senderId: currentUser.userId,
      senderUsername: currentUser.username || 'You',
      senderPhoto: currentUser.profilePhotoUrl,
      msgType: messageType as any,
      contentText: content,
      timestamp: new Date().toISOString(),
      status: 'SENDING' as const,
      // Add any other required fields with default values
      contentUrl: '',
      paymentTxnId: undefined,
      longitude: undefined,
      latitude: undefined
    }
    
    try {
      const socket = useSocketStore.getState().socket
      
      // Create updated messages array with the new temp message
      const updatedMessages = [...messages, tempMessage];
      
      // Save to localStorage immediately for instant feedback
      saveMessages(currentConversation.convoId, updatedMessages);
      
      // Update the UI with the temp message
      set(state => ({
        messages: updatedMessages,
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
      
      // The actual message update will happen when we receive the message from the server
      // via WebSocket, which will update both the UI and localStorage
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Failed to send message'
      
      // Update the message status to failed
      set(state => ({
        error: errorMessage,
        messages: state.messages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'FAILED' as const }
            : msg
        )
      }));
      
      console.error('Error sending message:', error);
    } finally {
      set({ isSending: false });
    }
  },
  // Load more messages for the current conversation (pagination)
  // Fetch messages for a conversation
  fetchMessages: async (conversationId: string) => {
    if (!conversationId) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // First try to load from localStorage for instant display
      const storedMessages = getStoredMessages(conversationId);
      
      // If we have stored messages, show them immediately
      if (storedMessages.length > 0) {
        set({
          messages: storedMessages,
          currentPage: 1,
          hasMoreMessages: true, // Assume there might be more messages
          isLoading: false
        });
      }
      
      // Then fetch fresh messages from the server
      const response = await chatAPI.getMessages(
        conversationId,
        1, // First page
        PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
      );
      
      if (response?.success) {
        // If we have fresh messages, update the store and localStorage
        if (response.messages?.length > 0) {
          saveMessages(conversationId, response.messages);
          
          set({
            messages: response.messages,
            currentPage: 1,
            hasMoreMessages: response.messages.length >= PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
            isLoading: false,
            error: null
          });
        } else if (storedMessages.length === 0) {
          // No messages from server and none in storage
          set({
            messages: [],
            currentPage: 1,
            hasMoreMessages: false,
            isLoading: false
          });
        }
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // If we have stored messages, use them even if the fetch failed
      const storedMessages = getStoredMessages(conversationId);
      if (storedMessages.length > 0) {
        set({
          messages: storedMessages,
          currentPage: 1,
          hasMoreMessages: true,
          isLoading: false,
          error: 'Using cached messages. Could not connect to server.'
        });
      } else {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch messages'
        });
      }
    }
  },
  
  loadMoreMessages: async () => {
    const { currentConversation, messages, currentPage } = get()
    if (!currentConversation || messages.length === 0) return;
    
    set({ isFetchingMore: true });
    
    try {
      const response = await chatAPI.getMessages(
        currentConversation.convoId, 
        currentPage + 1, // Next page
        PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
      )
      
      if (response?.success) {
        const newMessages = response.messages || [];
        const updatedMessages = [...messages, ...newMessages];
        
        // Save the updated messages to localStorage
        saveMessages(currentConversation.convoId, updatedMessages);
        
        set(state => ({
          messages: updatedMessages,
          currentPage: state.currentPage + 1,
          hasMoreMessages: newMessages.length >= PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
          isFetchingMore: false
        }));
      } else {
        throw new Error('Failed to load more messages');
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      set({
        isFetchingMore: false,
        error: error instanceof Error ? error.message : 'Failed to load more messages'
      });
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