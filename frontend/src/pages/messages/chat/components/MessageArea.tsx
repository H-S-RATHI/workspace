import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageCircle } from 'lucide-react';
import { formatMessageDate } from './DateHeader';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef } from 'react';

// Typing indicator component
export const TypingIndicator = () => (
  <div className="flex items-center space-x-1 px-4 py-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export const MessageArea = () => {
  const { messages = [] } = useChatStore();
  const currentUserId = useAuthStore(state => state.user?.userId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTyping = false; // TODO: Get typing status from store if needed
  // Group messages by date
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, message) => {
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
  }, {});

  return (
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
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={`date-${date}`} className="mb-4">
              <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2 text-center">
                <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {formatMessageDate(new Date(date))}
                </span>
              </div>
              {dateMessages.map((msg, index) => {
                if (!msg) {
                  console.warn('Undefined message in dateMessages array at index', index);
                  return null;
                }
                
                // Ensure we have required properties
                const hasRequiredProps = msg.senderId !== undefined && msg.timestamp !== undefined;
                if (!hasRequiredProps) {
                  console.warn('Message is missing required properties:', {
                    messageId: msg.messageId,
                    senderId: msg.senderId,
                    timestamp: msg.timestamp,
                    index,
                    message: msg
                  });
                }
                
                // Use messageId as key if available, otherwise fall back to index
                // This is safe because we're already checking for undefined messages above
                const messageKey = msg.messageId || `msg-${msg.timestamp}-${msg.senderId}-${index}`;
                
                return (
                  <MessageBubble
                    key={messageKey}
                    message={msg}
                    isCurrentUser={msg.senderId === currentUserId}
                  />
                );
              })}
            </div>
          ))
        )}
        {isTyping && <TypingIndicator key="typing-indicator" />}
        <div key="messages-end" ref={messagesEndRef} />
      </AnimatePresence>
    </div>
  );
};
