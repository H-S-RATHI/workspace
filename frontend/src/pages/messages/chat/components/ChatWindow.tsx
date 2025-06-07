import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socket/store';
import { useLogger } from '@/hooks/useLogger';
import { ChatHeader } from './ChatHeader';
import { MessageArea } from './MessageArea';
import { ChatInput } from './ChatInput';

const ChatWindow = () => {
  const { accessToken } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  const { debug } = useLogger('ChatWindow');
  
  // Memoize the WebSocket connection logic
  const setupWebSocket = useCallback(() => {
    debug('Setting up WebSocket connection');
    
    if (!accessToken) {
      debug('No access token available, cannot connect WebSocket');
      return;
    }
    
    connect();
    
    return () => {
      debug('Cleaning up WebSocket connection');
      disconnect();
    };
  }, [accessToken, connect, disconnect, debug]);
  
  // Set up WebSocket connection on mount and clean up on unmount
  useEffect(() => {
    setupWebSocket();
  }, [setupWebSocket]);
  


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
