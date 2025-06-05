import React from 'react';
import { MediaStreamsProps } from './types';

const MediaStreams: React.FC<MediaStreamsProps> = ({
  localVideoRef,
  remoteVideoRef,
  isVideoOff,
  callType,
  otherParty,
}) => {
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Remote Video Stream */}
      <div className="absolute inset-0 w-full h-full">
        {callType === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-800">
            <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {otherParty.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Local Video Preview */}
      {callType === 'video' && (
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <span className="text-sm text-white">Camera off</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaStreams;
