import { useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socket/store';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { ChatInput } from './ChatInput';

const ChatWindow = () => {
  // Memoize store selectors to prevent unnecessary re-renders
  const { isSending, sendMessage } = useChatStore();
  const { accessToken } = useAuthStore();
  const { connect, disconnect, isConnected } = useSocketStore();
  
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

  // Auto-scroll is now handled in MessageArea component
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      await sendMessage(content);
      // Auto-scroll is handled in MessageArea component
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <ChatHeader />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <MessageArea />
      </div>
      
      {/* Message input */}
      <ChatInput 
        isSending={isSending}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatWindow;
