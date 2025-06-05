import type { ChatState } from './types'
export const INITIAL_CHAT_STATE: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  currentPage: 1,
  hasMoreMessages: true,
  isFetchingMore: false,
  lastFetchAttempt: 0,
  lastFetchTime: 0,
  lastFetchSuccess: false
}
export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VOICE: 'VOICE',
  LOCATION: 'LOCATION',
  PAYMENT: 'PAYMENT'
} as const
export const MESSAGE_STATUS = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ'
} as const
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  INITIAL_PAGE: 1
} as const