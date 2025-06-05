import type { Conversation, Message, CreateConversationData, SendMessageData } from '../../types/chat'
export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  error: string | null
  lastFetchAttempt?: number
  lastFetchTime?: number
  lastFetchSuccess?: boolean
  currentPage: number
  hasMoreMessages: boolean
  isFetchingMore: boolean
}
export interface ChatActions {
  // Conversations
  fetchConversations: () => Promise<void>
  createConversation: (data: CreateConversationData) => Promise<Conversation | null>
  selectConversation: (conversationId: string) => Promise<void>
  
  // Messages
  sendMessage: (content: string, messageType?: 'TEXT' | 'IMAGE' | 'VOICE' | 'LOCATION' | 'PAYMENT') => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  
  // Search
  searchUsers: (query: string) => Promise<any[]>
  
  // Reset
  reset: () => void
}
export type ChatStore = ChatState & ChatActions
// Re-export chat types for convenience
export type { 
  Conversation, 
  Message, 
  CreateConversationData, 
  SendMessageData 
}