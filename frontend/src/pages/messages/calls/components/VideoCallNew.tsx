import React, { useState,  useEffect } from 'react';
import { VideoCallProps } from './types';
import useMediaStreams from './hooks/useMediaStreams';
import useWebRTC from './hooks/useWebRTC';
import useCallTimer from './hooks/useCallTimer';
import CallStatus from './CallStatus';
import CallControls from './CallControls';
import MediaStreams from './MediaStreams';

const VideoCall: React.FC<VideoCallProps> = ({
  callId,
  isIncoming,
  otherParty,
  callType,
  onCallEnd,
}) => {
  // State
  const [isCallActive, setIsCallActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Custom hooks
  const {
    localVideoRef,
    localStream,
    isVideoOff,
    isMuted,
    initializeMedia,
    toggleMute,
    toggleVideo,
    stopAllMediaTracks,
  } = useMediaStreams(callType);

  const {
    answerCall,
    rejectCall,
    endCall: endWebRTCCall,
    cleanup: cleanupWebRTC,
  } = useWebRTC(
    callId,
    otherParty,
    localStream,
    (stream) => setRemoteStream(stream),
    () => setIsCallActive(true)
  );

  const { callDuration } = useCallTimer(isCallActive);

  // Refs
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  // Effects
  useEffect(() => {
    // Set remote stream to video element when it changes
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Initialize media and handle call based on incoming/outgoing
  useEffect(() => {
    const initializeCall = async () => {
      try {
        await initializeMedia();
        if (!isIncoming) {
          // For outgoing calls, answer immediately
          await answerCall();
        }
      } catch (error) {
        console.error('Error initializing call:', error);
        handleEndCall();
      }
    };

    initializeCall();

    return () => {
      cleanupWebRTC();
      stopAllMediaTracks();
    };
  }, []);

  // Event handlers
  const handleAnswerCall = async () => {
    try {
      await answerCall();
      setIsCallActive(true);
    } catch (error) {
      console.error('Error answering call:', error);
      handleEndCall();
    }
  };

  const handleRejectCall = () => {
    rejectCall();
    cleanupCall();
  };

  const handleEndCall = () => {
    endWebRTCCall();
    cleanupCall();
  };

  const cleanupCall = () => {
    cleanupWebRTC();
    stopAllMediaTracks();
    onCallEnd();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Call Status */}
      <CallStatus
        callType={callType}
        isCallActive={isCallActive}
        callDuration={callDuration}
        otherParty={otherParty}
      />

      {/* Media Streams */}
      <div className="flex-1 relative">
        <MediaStreams
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isVideoOff={isVideoOff}
          callType={callType}
          otherParty={otherParty}
        />
      </div>

      {/* Incoming Call Controls */}
      {isIncoming && !isCallActive && (
        <div className="flex justify-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800">
          <button
            onClick={handleAnswerCall}
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Answer
          </button>
          <button
            onClick={handleRejectCall}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {/* Active Call Controls */}
      {(isCallActive || (!isIncoming && !isCallActive)) && (
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          callType={callType}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default VideoCall;
