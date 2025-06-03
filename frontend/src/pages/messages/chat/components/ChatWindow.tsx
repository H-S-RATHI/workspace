import { useState, useRef, useEffect, useMemo } from 'react';
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { DateHeader } from './DateHeader';
import { EmptyState, TypingIndicator } from './EmptyState';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../../../../store/chatStore'
import { useAuthStore } from '../../../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../../../types/chat';
import { useSocketStore } from '../../../../store/socketStore';

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

// Memoize the component to prevent unnecessary re-renders
const ChatWindow = () => {
  // Only log renders in development
  if (import.meta.env.MODE === 'development') {
    console.log('ChatWindow component rendered');
  }
  
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      console.log('ChatWindow mounted');
    }
    
    return () => {
      if (import.meta.env.MODE === 'development') {
        console.log('ChatWindow unmounted');
      }
    };
  }, []);
  
  // Memoize store selectors to prevent unnecessary re-renders
  const { currentConversation } = useChatStore();
  const messages = useChatStore((state) => state.messages || []);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isSending = useChatStore((state) => state.isSending || false);
  const currentUserId = useAuthStore((state) => state.user?.userId || '');
  const { isConnected } = useSocketStore();
  

  
  
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
    return <EmptyState title="No conversation selected" message="Select a conversation or start a new one to begin messaging" />;
  }
  
  // Group messages by date
  const groupedMessages = messages?.reduce<Record<string, Message[]>>((acc, message) => {
    if (!message || !message.timestamp) return acc;
    try {
      const date = new Date(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(message);
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
      {/* Socket connection warning */}
      {!isConnected && (
        <div className="bg-red-100 text-red-700 p-2 text-center text-sm font-medium">
          Not connected to chat server. Please check your connection or try again later.
        </div>
      )}
      {/* Chat header */}
      <ChatHeader
        name={currentConversation.displayName}
        status={isTyping ? 'typing' : 'online'}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onSearchClick={() => {}}
        onCallClick={() => {}}
        onVideoCallClick={() => {}}
      />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={`date-${date}`} className="mb-4">
                <DateHeader date={date} />
                {dateMessages
                  .filter((msg) => msg && msg.contentText && msg.contentText.trim() !== '')
                  .map((msg) => {
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
            ))
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Message input */}
      <ChatInput
        message={message}
        isSending={isSending}
        onMessageChange={setMessage}
        onSend={handleSendMessage}
        onAttachFile={() => fileInputRef.current?.click()}
      />
    </div>
  );
};

export default ChatWindow;
