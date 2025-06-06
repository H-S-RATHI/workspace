import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socket/store';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { ChatInput } from './ChatInput';

const ChatWindow = () => {
  // Memoize store selectors to prevent unnecessary re-renders
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <ChatHeader />
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <MessageArea />
      </div>
      
      {/* Message input */}
      <ChatInput />
    </div>
  );
};

export default ChatWindow;
