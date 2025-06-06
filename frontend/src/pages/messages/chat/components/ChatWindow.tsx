import React, { useEffect, useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic as MicIcon, 
  Video as VideoIcon, 
  MoreVertical,
  Search,
  Phone,
  MessageCircle,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socket/store';
// Avatar is used in the component but not directly in this file
import type { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './ChatHeader';

// Utility function to merge class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Utility function to get user initials
function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .join('')
    .substring(0, 2);
}



// Format message date header
const formatMessageDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center space-x-1 px-4 py-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// Message bubble component - memoized to prevent unnecessary re-renders


// Add display name for better debugging
MessageBubble.displayName = 'MessageBubble';


// Memoize the component to prevent unnecessary re-renders
const ChatWindow = () => {
  // Memoize store selectors to prevent unnecessary re-renders
  const { currentConversation, messages = [], isSending, sendMessage } = useChatStore();
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
  }, []);
  
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
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
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log('Selected file:', file);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };
  
  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };
  
  if (!currentConversation || !currentConversation.displayName) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversation selected</h3>
          <p className="text-gray-600 dark:text-gray-400">Select a conversation or start a new one to begin messaging</p>
        </div>
      </div>
    );
  }
  
  // Group messages by date
  const groupedMessages = messages?.reduce<Record<string, Message[]>>((acc, message) => {
    if (!message || !message.timestamp) return acc;
    
    try {
      const date = new Date(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(message);
      
      // Log when message is added to grouped messages
      console.log('Adding message to grouped messages:', {
        messageId: message.messageId,
        dateKey,
        content: message.contentText,
        timestamp: message.timestamp
      });
      
      return acc;
    } catch (error) {
      console.error('Error processing message date:', error);
      return acc;
    }
  }, {}) || {};
  
  // Log the final grouped messages
  useEffect(() => {
    console.log('Grouped messages:', Object.values(groupedMessages).flat().map(m => ({
      id: m.messageId,
      content: m.contentText,
      timestamp: m.timestamp
    })));
  }, [groupedMessages]);
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-50/30 to-white">
      {/* Chat header */}
      <ChatHeader />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Start the conversation by sending your first message
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => {
              // Log when messages are being rendered for a date group
              console.log(`Rendering ${dateMessages.length} messages for date: ${date}`);
              
              return (
                <div key={`date-${date}`} className="mb-4">
                  <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {formatMessageDate(new Date(date))}
                    </span>
                  </div>
                  {dateMessages.map((msg) => {
                    // Ensure we have a valid message ID
                    const messageKey = `msg-${msg.messageId || msg.timestamp}-${msg.senderId}`;
                    return (
                      <MessageBubble
                        key={messageKey}
                        message={msg}
                        isCurrentUser={msg.senderId === currentUserId}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
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
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              onChange={handleFileSelect}
            />
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
            >
              <div className="grid grid-cols-8 gap-2">
                {['😀', '😂', '😍', '😎', '👍', '❤️', '🔥', '🎉', '🙏', '👋'].map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                    onClick={() => {
                      setMessage(prev => prev + emoji);
                    }}
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
