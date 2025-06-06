import { useEffect } from 'react';
import { useSocketStore } from '../store/socketStore';
import { useAuthStore } from '../store/authStore';

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect, disconnect, isConnected } = useSocketStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      // No token available, ensure we're disconnected
      if (isConnected) {
        console.log('No access token, disconnecting WebSocket...');
        disconnect();
      }
      return;
    }

    if (isConnected) {
      // Already connected with the current token
      return;
    }

    console.log('Initializing WebSocket connection...');
    connect(); // The token is already in the auth store, no need to pass it

    return () => {
      // Only disconnect if we're still connected when component unmounts
      if (isConnected) {
        console.log('Cleaning up WebSocket connection...');
        disconnect();
      }
    };
  }, [accessToken, connect, disconnect, isConnected]);

  return <>{children}</>;
};

export default WebSocketProvider;
