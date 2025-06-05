import React from 'react';
import { CallStatusProps } from './types';

const CallStatus: React.FC<CallStatusProps> = ({
  callType,
  isCallActive,
  callDuration,
  otherParty,
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-xl font-semibold dark:text-white">
        {isCallActive ? 'In Progress' : callType === 'video' ? 'Video Call' : 'Voice Call'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {isCallActive ? (
          <span>Call with {otherParty.fullName} • {formatDuration(callDuration)}</span>
        ) : (
          <span>Calling {otherParty.fullName}...</span>
        )}
      </p>
    </div>
  );
};

export default CallStatus;
