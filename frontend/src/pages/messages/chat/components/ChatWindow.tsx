import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { SocketWarning } from './SocketWarning';
import { useChatStore } from '../../../../store/chatStore';
import { useAuthStore } from '../../../../store/authStore';
import { format } from 'date-fns';
import type { Message } from '../../../../types/chat';
import { useSocketStore } from '../../../../store/socketStore';
import { MessageList } from './MessageList';
import { useCall } from '../../calls/hooks/useCall';

const ChatWindow = () => {
  // Memoize store selectors to prevent unnecessary re-renders
  const { currentConversation } = useChatStore();
  const messages = useChatStore((state) => state.messages || []);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isSending = useChatStore((state) => state.isSending || false);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.userId || '';
  const { isConnected } = useSocketStore();
  const { initiateCall } = useCall();
  
  // Local state
  const [message, setMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocketStore(state => state.socket);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Memoize the other user from the conversation
  const otherUser = useMemo(() => {
    if (!currentConversation?.members) return undefined;
    return currentConversation.members.find((user) => user.userId !== currentUserId);
  }, [currentConversation?.members, currentUserId]);

  // Memoize call handlers
  const handleVideoCallClick = useCallback(async () => {
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
  }, [otherUser, initiateCall]);

  const handleAudioCallClick = useCallback(async () => {
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
  }, [otherUser, initiateCall]);

  // Handle typing indicator for current user
  useEffect(() => {
    if (!currentConversation?.convoId || !socket) return;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (message.trim()) {
      // Emit typing started event
      socket.emit('typing', { conversationId: currentConversation.convoId });
      
      // Set a timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: currentConversation.convoId });
      }, 2000);
    } else {
      // If message is empty, emit stop typing immediately
      socket.emit('stop_typing', { conversationId: currentConversation.convoId });
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, currentConversation?.convoId, socket]);
  
  // Listen for other user's typing status
  useEffect(() => {
    if (!socket) return;
    
    const handleTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === currentConversation?.convoId && data.userId !== currentUserId) {
        setIsOtherUserTyping(true);
      }
    };
    
    const handleStopTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === currentConversation?.convoId && data.userId !== currentUserId) {
        setIsOtherUserTyping(false);
      }
    };
    
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    
    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, currentConversation?.convoId, currentUserId]);
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherUserTyping, scrollToBottom]);
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, isSending, sendMessage]);
  
  // Group messages by date
  const groupedMessages = useMemo(() => {
    return messages.reduce<Record<string, Message[]>>((acc, message) => {
      if (!message?.timestamp) return acc;
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
    }, {});
  }, [messages]);

  if (!currentConversation?.displayName) {
    return (
      <EmptyState 
        title="No conversation selected" 
        message="Select a conversation or start a new one to begin messaging" 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-blue-50/30 to-white">
      <SocketWarning isConnected={isConnected} />
      
      <ChatHeader
        name={currentConversation.displayName}
        status={isOtherUserTyping ? 'typing' : 'online'}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onSearchClick={() => {}}
        onCallClick={handleAudioCallClick}
        onVideoCallClick={handleVideoCallClick}
      />
      
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList
          groupedMessages={groupedMessages}
          currentUserId={currentUserId}
          isTyping={isOtherUserTyping}
          messagesEndRef={messagesEndRef}
        />
      )}
      
      <div className="p-4 border-t border-gray-100">
        <ChatInput
          message={message}
          isSending={isSending}
          onMessageChange={setMessage}
          onSend={handleSendMessage}
          onAttachFile={() => fileInputRef.current?.click()}
        />
      </div>
    </div>
  );
};

// Display name for debugging
ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
