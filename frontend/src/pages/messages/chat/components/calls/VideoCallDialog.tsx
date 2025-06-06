import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, Video, VideoOff, Volume2, VolumeX, User, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/timeUtils';

type VideoCallDialogProps = {
  isOpen: boolean;
  recipientName: string;
  recipientAvatar?: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onToggleFullscreen: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn: boolean;
  isFullscreen: boolean;
  callDuration: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export function VideoCallDialog({
  isOpen,
  recipientName,
  recipientAvatar,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onToggleFullscreen,
  onEndCall,
  isMuted,
  isVideoOn,
  isSpeakerOn,
  isFullscreen,
  callDuration,
  localStream,
  remoteStream,
}: VideoCallDialogProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-gray-900 flex flex-col z-50 ${isFullscreen ? 'top-0 left-0 right-0 bottom-0' : 'm-4 rounded-2xl overflow-hidden'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Remote Video */}
      <div className="flex-1 relative bg-black">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={recipientName}
                  className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-indigo-600 dark:text-indigo-300" />
                </div>
              )}
              <h3 className="text-xl font-semibold text-white">{recipientName}</h3>
              <p className="text-gray-300">Calling...</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video */}
      {isVideoOn && localStream && (
        <div className="absolute bottom-24 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Call Info */}
      <div className={`absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <span>{formatDuration(callDuration)}</span>
        <span className="mx-2">•</span>
        <span>{recipientName}</span>
      </div>

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex justify-center gap-4 mb-2">
          <Button
            variant={isMuted ? 'outline' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={!isVideoOn ? 'outline' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onToggleVideo}
            aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onEndCall}
            aria-label="End call"
          >
            <Phone className="h-5 w-5 transform rotate-135" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onToggleSpeaker}
            aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
          >
            {isSpeakerOn ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
