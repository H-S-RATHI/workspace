import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Video, Menu, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { Message } from '../../types/chat';

export const ChatWindow = () => {
  const { 
    currentConversation, 
    messages = [], 
    sendMessage, 
    isSending = false 
  } = useChatStore();
  
  const [message, setMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    await sendMessage(message);
    setMessage('');
  };
  
  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-600">Select a conversation or start a new one to begin messaging</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {currentConversation.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{currentConversation.displayName}</h3>
            <p className="text-xs text-gray-500">
              {currentConversation.members.length} member{currentConversation.members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg: Message) => (
            <motion.div
              key={msg.messageId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  msg.senderId === 'current-user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="text-sm">{msg.contentText || ''}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
