import { useState, useEffect, useMemo } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Message } from '../../../../types/chat';
import { cn } from './utils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
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

// Message bubble component - memoized to prevent unnecessary re-renders
export const MessageBubble = ({ 
  message, 
  isCurrentUser 
}: MessageBubbleProps) => {
  const [showTime, setShowTime] = useState(false);
  
  // Debug log when message is rendered
  useEffect(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Rendering MessageBubble:', { 
        messageId: message.messageId, 
        isCurrentUser,
        showTime,
        timestamp: message.timestamp
      });
    }
  }, [message, isCurrentUser, showTime, message.timestamp, message.messageId]);
  
  // Memoize the status indicator to prevent re-renders
  const statusIndicator = useMemo(() => {
    if (!isCurrentUser) return null;
    
    return (
      <span className="ml-1">
        {message.status === 'SENT' && <Check className="w-3 h-3" />}
        {message.status === 'DELIVERED' && <CheckCheck className="w-3 h-3" />}
        {message.status === 'READ' && <CheckCheck className="w-3 h-3 text-blue-200" />}
      </span>
    );
  }, [isCurrentUser, message.status]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex',
        isCurrentUser ? 'justify-end' : 'justify-start',
        'mb-2 px-4',
        'message-bubble-container'
      )}
    >
      <div 
        className={cn(
          'max-w-xs px-4 py-2 rounded-lg',
          isCurrentUser 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md' 
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100',
          'hover:shadow-lg transition-all duration-200',
          'message-bubble'
        )}
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        <p className="text-sm whitespace-pre-wrap break-words message-content">
          {message.contentText || ''}
        </p>
        <div 
          className={cn(
            'flex items-center justify-end mt-1 space-x-1 transition-opacity',
            showTime ? 'opacity-100' : 'opacity-0',
            'text-xs message-timestamp',
            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          <span className="timestamp">{formatMessageTime(message.timestamp)}</span>
          {statusIndicator}
        </div>
      </div>
    </motion.div>
  );
};

MessageBubble.displayName = 'MessageBubble';
