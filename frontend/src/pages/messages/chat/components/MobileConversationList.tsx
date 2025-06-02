import { useEffect, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { useChatStore } from '../../../../store/chatStore'

interface MobileConversationListProps {
  onSelectConversation: () => void
}

const MobileConversationList = ({ onSelectConversation }: MobileConversationListProps) => {
  const { 
    conversations, 
    fetchConversations, 
    selectConversation,
    searchUsers,
    createConversation
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    try {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    }
  }
  
  const startNewChat = async (userId: string) => {
    try {
      const conversation = await createConversation({
        participantIds: [userId],
        isGroup: false
      })
      
      if (conversation) {
        setSearchQuery('')
        setSearchResults([])
        onSelectConversation()
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const handleConversationSelect = (convoId: string) => {
    selectConversation(convoId)
    onSelectConversation()
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="block w-full pl-10 pr-3 py-3 border-0 rounded-xl bg-white/20 backdrop-blur-sm placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
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
                className="px-4 py-3 hover:bg-blue-100 cursor-pointer flex items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-lg">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.fullName || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <div className="text-blue-600">
                  <Plus size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-blue-500" />
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
                className="px-4 py-4 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">
                      {conversation.displayName?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {conversation.displayName}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(conversation.lastMessageAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage?.contentText || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="ml-3 flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
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