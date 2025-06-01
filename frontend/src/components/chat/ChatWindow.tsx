import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, Search, MoreVertical, Smile } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'

export const ChatWindow = () => {
  const { 
    currentConversation, 
    messages, 
    sendMessage, 
    isSending 
  } = useChatStore()
  
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return
    
    await sendMessage(message)
    setMessage('')
  }
  
  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-600">Select a conversation or start a new one to begin messaging</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {currentConversation.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{currentConversation.displayName}</h3>
            <p className="text-xs text-gray-500">
              {currentConversation.members.length} member{currentConversation.members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Search size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.messageId} 
            className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId === 'current-user' 
                  ? 'bg-primary-100 text-primary-900 rounded-br-none' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.contentText}</p>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="text-gray-500 hover:text-gray-700">
            <Paperclip size={20} />
          </button>
          <button type="button" className="text-gray-500 hover:text-gray-700">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {message ? (
            <button 
              type="submit" 
              disabled={isSending}
              className="bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          ) : (
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Mic size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
