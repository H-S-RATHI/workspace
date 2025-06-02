import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { useChatStore } from '../../../../store/chatStore'

export const ConversationList = () => {
  const { 
    conversations, 
    currentConversation, 
    fetchConversations, 
    selectConversation,
    searchUsers,
    createConversation,
    isLoading,
    error
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Fetch conversations on mount with error handling
  useEffect(() => {
    const loadConversations = async () => {
      try {
        await fetchConversations();
      } catch (error) {
        // Error is already handled in the store
        console.log('Failed to load conversations, will retry...');
      }
    };
    
    loadConversations();
    
    // Set up polling to retry failed requests
    const pollInterval = setInterval(() => {
      const { isLoading, error } = useChatStore.getState();
      if (error && !isLoading) {
        loadConversations();
      }
    }, 10000); // Retry every 10 seconds if there's an error
    
    return () => clearInterval(pollInterval);
  }, [fetchConversations])
  
  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    try {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {

    }
  }
  
  // Start a new conversation
  const startNewChat = async (userId: string) => {
    try {
      const conversation = await createConversation({
        participantIds: [userId],
        isGroup: false
      })
      
      if (conversation) {
        setSearchQuery('')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }
  
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Messages</h2>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="block w-full pl-10 pr-3 py-2 border-0 rounded-lg bg-white/20 backdrop-blur-sm placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/30"
          />
        </form>
      </div>
      
      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="px-4 py-2 text-xs font-medium text-blue-600 uppercase tracking-wider">
            Search Results
          </div>
          <div className="overflow-y-auto max-h-64">
            {searchResults.map((user) => (
              <div 
                key={user.userId}
                onClick={() => startNewChat(user.userId)}
                className="px-4 py-3 hover:bg-blue-100 cursor-pointer flex items-center transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                  <span className="text-white font-medium">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.fullName || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <div className="text-blue-600">
                  <Plus size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
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
            className="ml-2 px-3 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-md text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && conversations.length === 0 && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {!isLoading && error && conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                onClick={() => selectConversation(conversation.convoId)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  currentConversation?.convoId === conversation.convoId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                    <span className="text-white font-medium">
                      {conversation.displayName?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.displayName}
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
