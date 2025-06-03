import React from 'react';

interface SocketWarningProps {
  isConnected: boolean;
}

export const SocketWarning: React.FC<SocketWarningProps> = ({ isConnected }) => {
  if (isConnected) return null;
  return (
    <div className="bg-red-100 text-red-700 p-2 text-center text-sm font-medium">
      Not connected to chat server. Please check your connection or try again later.
    </div>
  );
};
