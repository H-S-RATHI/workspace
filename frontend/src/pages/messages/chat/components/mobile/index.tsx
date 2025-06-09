// Export both components with named exports
export { default as MobileConversationList } from './MobileConversationList';
export { default as MobileChatWindow } from './MobileChatWindow';

// Export types
export type { 
  MobileConversationListProps,
  MobileChatWindowProps 
} from './types';

// Re-export components for external use if needed
export { 
  SearchBar,
  ErrorState,
  LoadingState,
  EmptyMessagesState,
  SearchResults,
  ConversationItem,
  ConversationsList
} from './components';

// Re-export hooks for external use if needed
export { useDebouncedFetch } from './hooks/useDebouncedFetch';
export { useDebouncedSearch } from './hooks/useDebouncedSearch';

// Re-export utilities for external use if needed
export * from './utils/conversationUtils';

// Re-export remaining types for external use if needed
export * from './types';

// Re-export components for external use if needed
export { 
  DateHeader,
  ChatHeader,
  MessagesArea,
  MessageInput,
  EmptyConversationState
} from './components';
// Re-export hooks for external use if needed
export { useScrollManagement } from './hooks/useScrollManagement';
export { useCallHandling } from './hooks/useCallHandling';
export { useMessageHandling } from './hooks/useMessageHandling';
// Re-export utilities for external use if needed
export * from './utils/messageUtils';
export * from './utils/dateUtils';
// Re-export types for external use if needed
export * from './types';