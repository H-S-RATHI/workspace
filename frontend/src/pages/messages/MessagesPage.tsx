import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ConversationList } from '../../components/chat/ConversationList'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { ArrowLeft, Search, Plus, Phone, Video, MoreVertical } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'

// Mobile Conversation List Component
const MobileConversationList = ({ onSelectConversation }: { onSelectConversation: () => void }) => {
  const { 
    conversations, 
    currentConversation, 
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

// Mobile Chat Window Component
const MobileChatWindow = ({ onBack }: { onBack: () => void }) => {
  const { currentConversation, messages, sendMessage, isSending } = useChatStore()
  const [message, setMessage] = useState('')

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return
    
    try {
      await sendMessage(message)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500">No conversation selected</p>
          <button onClick={onBack} className="mt-2 text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/20 rounded-full transition-colors mr-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <span className="text-white font-semibold">
            {currentConversation.displayName?.charAt(0).toUpperCase() || 'C'}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{currentConversation.displayName}</h3>
          <p className="text-xs text-white/80">Online</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-md">
              Start the conversation by sending your first message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.messageId}
                className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    msg.senderId === 'current-user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.contentText}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={!message.trim() || isSending}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

// Chat Tab Component
const ChatTab = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setShowChat(false) // Reset mobile state when switching to desktop
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        {!showChat ? (
          <MobileConversationList onSelectConversation={() => setShowChat(true)} />
        ) : (
          <MobileChatWindow onBack={() => setShowChat(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <ConversationList />
      <ChatWindow />
    </div>
  )
}

// Calls Tab Component
const CallsTab = () => (
  <div className="p-6 h-full overflow-y-auto">
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Calls</h2>
        <p className="text-gray-600">Manage your call history and make new calls</p>
      </div>
      
      <div className="space-y-3">
        {[
          { name: 'Mike Brown', type: 'Outgoing', duration: '5 min', time: '3h', avatar: '/api/placeholder/40/40' },
          { name: 'Sarah Wilson', type: 'Incoming', duration: '12 min', time: '1d', avatar: '/api/placeholder/40/40' },
          { name: 'John Doe', type: 'Missed', duration: '0 min', time: '2d', avatar: '/api/placeholder/40/40' },
          { name: 'Emma Davis', type: 'Outgoing', duration: '8 min', time: '3d', avatar: '/api/placeholder/40/40' },
          { name: 'Alex Johnson', type: 'Incoming', duration: '15 min', time: '5d', avatar: '/api/placeholder/40/40' },
        ].map((call, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {call.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{call.name}</h3>
                <p className={`text-sm ${
                  call.type === 'Missed' ? 'text-red-600' : 
                  call.type === 'Incoming' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {call.type} call • {call.duration}
                </p>
              </div>
              <div className="text-sm text-gray-500">{call.time}</div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Status Tab Component
const StatusTab = () => (
  <div className="p-6 h-full overflow-y-auto">
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Status Updates</h2>
        <p className="text-gray-600">Share what's happening in your life</p>
      </div>
      
      <div className="space-y-6">
        {/* My Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">My Status</h3>
          <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group">
            <div className="text-gray-600 group-hover:text-blue-600">
              <div className="text-3xl mb-3">📸</div>
              <p className="font-medium">Tap to add status update</p>
              <p className="text-sm text-gray-500 mt-1">Share a photo, video, or text</p>
            </div>
          </button>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Updates</h3>
          <div className="space-y-4">
            {[
              { name: 'Alice Johnson', time: '2h ago', viewed: false },
              { name: 'Bob Smith', time: '5h ago', viewed: true },
              { name: 'Carol Davis', time: '1d ago', viewed: true },
              { name: 'David Wilson', time: '2d ago', viewed: true },
            ].map((status, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div className={`w-12 h-12 rounded-full border-3 ${
                  status.viewed ? 'border-gray-300' : 'border-green-500'
                } p-0.5`}>
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {status.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{status.name}</h4>
                  <p className="text-sm text-gray-500">{status.time}</p>
                </div>
                {!status.viewed && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const MessagesPage = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  // Determine which component to render based on the current path
  const currentPath = location.pathname
  
  if (currentPath === '/messages/calls') {
    return <CallsTab />
  } else if (currentPath === '/messages/status') {
    return <StatusTab />
  } else {
    return <ChatTab />
  }
}

export default MessagesPage