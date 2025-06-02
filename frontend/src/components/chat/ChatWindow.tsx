import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Check,
  CheckCheck,
  MessageCircle,
  Video,
  MoreVertical,
  Search,
  Phone,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../types/chat';

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

// Format message timestamp
const formatMessageTime = (timestamp: string | Date): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

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

// Message bubble component
const MessageBubble = ({ 
  message, 
  isCurrentUser 
}: { 
  message: Message; 
  isCurrentUser: boolean;
}) => {
  const [showTime, setShowTime] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex',
        isCurrentUser ? 'justify-end' : 'justify-start',
        'mb-2 px-4'
      )}
    >
      <div 
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl relative',
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md' 
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100',
          'hover:shadow-lg transition-all duration-200'
        )}
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.contentText || ''}</p>
        <div className={cn(
          'flex items-center justify-end mt-1 space-x-1 transition-opacity',
          showTime ? 'opacity-100' : 'opacity-0',
          'text-xs',
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        )}>
          <span>{formatMessageTime(message.timestamp)}</span>
          {isCurrentUser && (
            <span className="ml-1">
              {message.status === 'SENT' && <Check className="w-3 h-3" />}
              {message.status === 'DELIVERED' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'READ' && <CheckCheck className="w-3 h-3 text-blue-200" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Chat header component
const ChatHeader = ({ 
  name, 
  status 
}: { 
  name: string; 
  status: 'online' | 'offline' | 'typing';
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {getInitials(name)}
        </div>
        <span className={cn(
          'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
          status === 'online' ? 'bg-green-500' : 'bg-gray-300'
        )} />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
        <p className="text-xs text-gray-500">
          {status === 'typing' ? 'typing...' : status === 'online' ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Phone className="w-5 h-5" />
      </button>
      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Video className="w-5 h-5" />
      </button>
      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <Search className="w-5 h-5" />
      </button>
      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
      <MessageCircle className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">
      Start the conversation by sending your first message
    </p>
  </div>
);

export const ChatWindow = () => {
  const currentConversation = useChatStore((state) => state.currentConversation);
  const messages = useChatStore((state) => state.messages || []);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isSending = useChatStore((state) => state.isSending || false);
  
  const [message, setMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      return acc;
    } catch (error) {
      console.error('Error processing message date:', error);
      return acc;
    }
  }, {}) || {};
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-50/30 to-white">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
              {getInitials(currentConversation.displayName || '')}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentConversation.displayName}</h3>
              <p className="text-xs text-white/80">
                {isTyping ? 'typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
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
            Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {formatMessageDate(new Date(dateKey))}
                  </span>
                </div>
                {dateMessages.map((msg) => (
                  <MessageBubble 
                    key={msg.messageId} 
                    message={msg} 
                    isCurrentUser={msg.senderId === 'current-user'} 
                  />
                ))}
              </div>
            ))
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
