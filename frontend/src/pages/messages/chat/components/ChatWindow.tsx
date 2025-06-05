import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { SocketWarning } from './SocketWarning';
import { useChatStore } from '../../../../store/chatStore'
import { useAuthStore } from '../../../../store/authStore';
import { format } from 'date-fns';
import type { Message, ConversationMember } from '../../../../types/chat';
import { useSocketStore } from '../../../../store/socketStore';
import { MessageList } from './MessageList';
import { useCall } from '../../calls/hooks/useCall';



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
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.userId || '';
  const { isConnected } = useSocketStore();
  const { initiateCall } = useCall();
  
  // Get the other user from the conversation
  const otherUser = currentConversation?.members?.find(
    (user: ConversationMember) => user.userId !== currentUserId
  ) as ConversationMember | undefined;
  
  // Log the current state for debugging
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      console.log('Current conversation:', currentConversation);
      console.log('Current user ID:', currentUserId);
      console.log('Other user:', otherUser);
    }
  }, [currentConversation, currentUserId, otherUser]);
  
  const handleVideoCallClick = async () => {
    if (!otherUser) {
      console.error('Cannot start video call: No other user in conversation');
      alert('Cannot start video call: No user selected');
      return;
    }
    
    try {
      console.log('Initiating video call with user:', otherUser.userId);
      const callId = await initiateCall({
        targetUserId: otherUser.userId,
        callType: 'video',
      });
      console.log('Video call initiated successfully with ID:', callId);
    } catch (error) {
      console.error('Error initiating video call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video call';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleAudioCallClick = async () => {
    if (!otherUser) {
      console.error('Cannot start audio call: No other user in conversation');
      alert('Cannot start audio call: No user selected');
      return;
    }
    
    try {
      console.log('Initiating audio call with user:', otherUser.userId);
      const callId = await initiateCall({
        targetUserId: otherUser.userId,
        callType: 'audio',
      });
      console.log('Audio call initiated successfully with ID:', callId);
    } catch (error) {
      console.error('Error initiating audio call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start audio call';
      alert(`Error: ${errorMessage}`);
    }
  };

  
  
  const [message, setMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
  
  // Use the otherUser defined at the top of the component
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-50/30 to-white">
      <SocketWarning isConnected={isConnected} />
      {/* Chat header */}
      <ChatHeader
        name={currentConversation.displayName}
        status={isTyping ? 'typing' : 'online'}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onSearchClick={() => {}}
        onCallClick={handleAudioCallClick}
        onVideoCallClick={handleVideoCallClick}
      />
      
      {/* Messages area */}
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList
          groupedMessages={groupedMessages}
          currentUserId={currentUserId}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      )}
      
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
