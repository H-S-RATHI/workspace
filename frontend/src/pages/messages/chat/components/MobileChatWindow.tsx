import { useState, useMemo, useRef } from 'react'
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react'
import { useChatStore } from '../../../../store/chatStore'
import { useAuthStore } from '../../../../store/authStore'
import { DateHeader } from './DateHeader'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../../../../types/chat'

interface MobileChatWindowProps {
  onBack: () => void
}

const MobileChatWindow = ({ onBack }: MobileChatWindowProps) => {
  const { currentConversation, messages, sendMessage, isSending } = useChatStore()
  const currentUserId = useAuthStore((state) => state.user?.userId || '')
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Group messages by date (same as ChatWindow)
  const groupedMessages = useMemo(() => {
    return messages
      .filter((msg) => msg && msg.contentText && msg.contentText.trim() !== '')
      .reduce<Record<string, Message[]>>((acc, message) => {
        if (!message || !message.timestamp) return acc
        try {
          const date = new Date(message.timestamp)
          const dateKey = date.toISOString().split('T')[0]
          if (!acc[dateKey]) acc[dateKey] = []
          acc[dateKey].push(message)
          return acc
        } catch {
          return acc
        }
      }, {})
  }, [messages])

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
        {Object.keys(groupedMessages).length === 0 ? (
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
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={`date-${date}`} className="mb-4">
              <DateHeader date={date} />
              {dateMessages.map((msg) => (
                <MessageBubble
                  key={`msg-${msg.messageId || msg.timestamp}-${msg.senderId}`}
                  message={msg}
                  isCurrentUser={msg.senderId === currentUserId}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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

export default MobileChatWindow