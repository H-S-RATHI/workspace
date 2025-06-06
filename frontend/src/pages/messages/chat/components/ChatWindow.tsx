import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socket/store';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';

// Emoji data - could be moved to a separate file if needed
const EMOJIS = ['😀', '😂', '😍', '😎', '👍', '❤️', '🔥', '🎉', '🙏', '👋'];




const ChatWindow = () => {
  // Memoize store selectors to prevent unnecessary re-renders
  const { messages = [], isSending, sendMessage } = useChatStore();
  const { accessToken, user } = useAuthStore();
  const { connect, disconnect, isConnected } = useSocketStore();
  const currentUserId = user?.userId || '';
  
  // Only log renders in development
  if (process.env.NODE_ENV === 'development') {
    console.log('ChatWindow component rendered', { isConnected });
  }
  
  // Handle WebSocket connection
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ChatWindow mounted - setting up WebSocket');
    }
    
    if (accessToken) {
      console.log('Connecting to WebSocket...');
      connect();
    } else {
      console.warn('No access token available, cannot connect WebSocket');
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('ChatWindow unmounting - cleaning up WebSocket');
      }
      disconnect();
    };
  }, [accessToken, connect, disconnect]);
  
  // Handle WebSocket connection
  React.useEffect(() => {
    console.log('ChatWindow mounted, connecting to WebSocket...')
    
    // Only connect if we have an access token
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) {
      console.log('No access token available, skipping WebSocket connection')
      return
    }
    
    // Connect to WebSocket
    console.log('Connecting to WebSocket...')
    connect()
    
    // Cleanup function
    return () => {
      // Cleanup WebSocket connection on unmount
      // For example: disconnectWebSocket();
    };
  }, [accessToken, connect]);

  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Simulate typing indicator for demo purposes
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (message) {
      setIsTyping(true);
      timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else {
      setIsTyping(false);
    }
    
    return () => clearTimeout(timeout);
  }, [message]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    try {
      await sendMessage(message);
      setMessage('');
      setIsEmojiPickerOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const toggleEmojiPicker = useCallback(() => {
    setIsEmojiPickerOpen(prev => !prev);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-50/30 to-white">
      {/* Chat header */}
      <ChatHeader />

      {/* Messages area */}
      <MessageArea 
        messages={messages}
        isTyping={isTyping}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />

      {/* Message input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form 
          ref={formRef}
          onSubmit={handleSendMessage}
          className="flex items-end space-x-3"
        >
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleEmojiPicker}
            aria-label="Select emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full min-h-[44px] max-h-32 px-4 py-3 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
              rows={1}
            />
            <button 
              type="button" 
              className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={toggleEmojiPicker}
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={!message.trim() || isSending}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {/* Emoji picker */}
        <AnimatePresence>
          {isEmojiPickerOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 absolute bottom-16 right-4 w-64 h-64 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-8 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                    onClick={() => {
                      setMessage(prev => prev + emoji);
                      setIsEmojiPickerOpen(false);
                    }}
                    aria-label={`Select ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatWindow;
