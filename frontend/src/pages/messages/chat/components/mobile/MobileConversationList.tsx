import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../../../../../store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { MobileConversationListProps, CreateConversationParams } from './types';
import { findExistingConversation } from './utils/conversationUtils';
import { useDebouncedFetch } from './hooks/useDebouncedFetch';
import { useDebouncedSearch } from './hooks/useDebouncedSearch';
import {
  SearchBar,
  ErrorState,
  LoadingState,
  SearchResults,
  ConversationsList
} from './components';
const MobileConversationList: React.FC<MobileConversationListProps> = ({ 
  onSelectConversation 
}) => {
  const { 
    conversations, 
    currentConversation,
    fetchConversations, 
    selectConversation,
    searchUsers,
    createConversation,
    isLoading,
    error
  } = useChatStore();
  
  const currentUserId = useAuthStore(state => state.user?.userId);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Custom hooks for debounced operations
  const { debouncedFetch } = useDebouncedFetch({
    fetchFunction: fetchConversations
  });
  const {
    searchQuery,
    searchResults,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch
  } = useDebouncedSearch({
    searchFunction: searchUsers
  });
  // Initial load
  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch]);
  // Start a new conversation or navigate to existing one
  const startNewChat = async (userId: string) => {
    if (!currentUserId) {
      toast.error('You need to be logged in to start a chat');
      return;
    }
    try {
      // For self-chat, ensure we're only including the current user
      const participantIds = userId === currentUserId ? [currentUserId] : [userId];
      
      // Check if conversation already exists
      const existingConv = findExistingConversation(conversations, userId, currentUserId);
      
      if (existingConv) {
        // If conversation exists, select it
        await selectConversation(existingConv.convoId);
      } else {
        // Otherwise, create a new conversation
        const conversationParams: CreateConversationParams = {
          participantIds,
          isGroup: false
        };
        
        const conversation = await createConversation(conversationParams);
        
        if (conversation) {
          await selectConversation(conversation.convoId);
        } else {
          throw new Error('Failed to create conversation');
        }
      }
      
      // Clear search and close the mobile panel
      clearSearch();
      onSelectConversation();
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };
  const handleConversationSelect = async (convoId: string) => {
    try {
      await selectConversation(convoId);
      onSelectConversation();
    } catch (error) {
      console.error('Error selecting conversation:', error);
      toast.error('Failed to open conversation');
    }
  };
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await fetchConversations();
    } finally {
      setIsRetrying(false);
    }
  };
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Search Header */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />
      
      {/* Error state */}
      {error && (
        <ErrorState
          error={error}
          isLoading={isLoading}
          isRetrying={isRetrying}
          onRetry={handleRetry}
        />
      )}
      
      {/* Loading state */}
      {isLoading && conversations.length === 0 && <LoadingState />}
      
      {/* Search results */}
      <SearchResults
        searchQuery={searchQuery}
        searchResults={searchResults}
        conversations={conversations}
        currentUserId={currentUserId}
        onSelectExistingConversation={handleConversationSelect}
        onStartNewChat={startNewChat}
      />
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        <ConversationsList
          conversations={conversations}
          currentConversation={currentConversation}
          currentUserId={currentUserId}
          isLoading={isLoading}
          error={error}
          onConversationSelect={handleConversationSelect}
        />
      </div>
    </div>
  );
};
export default MobileConversationList;