import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../../../../store/chatStore';
import { useAuthStore } from '@/store/authStore';

interface MobileConversationListProps {
  onSelectConversation: () => void
}

const MobileConversationList = ({ onSelectConversation }: MobileConversationListProps) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds minimum between fetches
  
  // Debounced fetch conversations
  const debouncedFetchConversations = useCallback(
    debounce(async (force = false) => {
      if (!isMounted.current) return;
      
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Skip if we've fetched recently and it's not a forced refresh
      if (!force && timeSinceLastFetch < MIN_FETCH_INTERVAL) {
        return;
      }
      
      try {
        await fetchConversations();
        lastFetchTime.current = Date.now();
      } catch (error) {
        console.error('Failed to load conversations:', error);
        if (!isMounted.current) return;
      } finally {
        // Cleanup handled by isMounted ref
      }
    }, 500),
    [fetchConversations]
  );

  // Initial load and setup
  useEffect(() => {
    isMounted.current = true;
    debouncedFetchConversations();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedFetchConversations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedFetchConversations.cancel();
    };
  }, [debouncedFetchConversations]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      try {
        const results = await searchUsers(query);
        if (isMounted.current) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (isMounted.current) {
          setSearchResults([]);
        }
      }
    }, 300),
    [searchUsers]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      debouncedFetchConversations.cancel();
      debouncedSearch.cancel();
    };
  }, [debouncedFetchConversations, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };
  
  // Check if a conversation already exists with the given user
  const findExistingConversation = (userId: string) => {
    if (!currentUserId) return null;
    
    return conversations.find(conv => {
      // Skip group chats
      if (conv.isGroup) return false;
      
      const memberIds = conv.members?.map(m => m.userId) || [];
      
      // For self-chat (talking to yourself)
      if (userId === currentUserId) {
        return memberIds.length === 1 && memberIds[0] === currentUserId;
      }
      
      // For conversations with other users
      return memberIds.includes(userId) && memberIds.includes(currentUserId);
    });
  };

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
      const existingConv = findExistingConversation(userId);
      
      if (existingConv) {
        // If conversation exists, select it
        await selectConversation(existingConv.convoId);
      } else {
        // Otherwise, create a new conversation
        const conversation = await createConversation({
          participantIds,
          isGroup: false
        });
        
        if (conversation) {
          await selectConversation(conversation.convoId);
        } else {
          throw new Error('Failed to create conversation');
        }
      }
      
      // Clear search and close the mobile panel
      setSearchQuery('');
      setSearchResults([]);
      onSelectConversation();
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  }

  const handleConversationSelect = async (convoId: string) => {
    try {
      await selectConversation(convoId);
      onSelectConversation();
    } catch (error) {
      console.error('Error selecting conversation:', error);
      toast.error('Failed to open conversation');
    }
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search or start new chat"
            className="block w-full pl-10 pr-3 py-2 border-0 rounded-xl bg-white/20 backdrop-blur-sm placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Search conversations or users"
          />
        </form>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={async () => {
              setIsRetrying(true);
              try {
                await fetchConversations();
              } finally {
                setIsRetrying(false);
              }
            }}
            disabled={isLoading || isRetrying}
            className="ml-2 px-3 py-1 bg-white border border-red-200 rounded-md text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && conversations.length === 0 && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Search results */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="px-4 py-2 text-xs font-medium text-blue-600 uppercase tracking-wider">
            Search Results
          </div>
          <div className="overflow-y-auto max-h-64">
            {searchResults.map((user) => {
              const isCurrentUser = user.userId === currentUserId;
              const existingConvo = findExistingConversation(user.userId);
              const displayName = isCurrentUser ? 'Your Notes' : user.fullName || 'Unknown User';
              const username = isCurrentUser ? 'notes' : user.username;
              
              return (
                <div 
                  key={user.userId}
                  onClick={() => {
                    if (existingConvo) {
                      handleConversationSelect(existingConvo.convoId);
                    } else {
                      startNewChat(user.userId);
                    }
                  }}
                  className="px-4 py-3 hover:bg-blue-100 cursor-pointer flex items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    isCurrentUser 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    {user.profilePhotoUrl && !isCurrentUser ? (
                      <img 
                        src={user.profilePhotoUrl} 
                        alt={displayName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {isCurrentUser ? 'Y' : (user.fullName?.charAt(0).toUpperCase() || 'U')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      {existingConvo && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {isCurrentUser ? 'Your Notes' : 'Chat exists'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      @{username}
                    </p>
                  </div>
                  <div className="text-blue-600 flex-shrink-0">
                    {existingConvo ? (
                      <span className="text-xs text-gray-500">Open</span>
                    ) : (
                      <Plus size={20} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {!isLoading && error && conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Failed to load conversations. Please try again later.
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-600 font-medium">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">Search for a user to start chatting</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <div 
                key={conversation.convoId}
                onClick={() => handleConversationSelect(conversation.convoId)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  currentConversation?.convoId === conversation.convoId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-medium">
                      {conversation.displayName?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.members?.length === 1 && conversation.members[0].userId === currentUserId 
                          ? 'You' 
                          : conversation.displayName}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(conversation.lastMessageAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.lastMessage?.contentText || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileConversationList