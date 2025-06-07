import { useRef, useEffect } from 'react';
import { BaseCallDialog } from './BaseCallDialog';

type VideoCallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
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
  onClose,
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

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <BaseCallDialog
      isOpen={isOpen}
      onClose={onClose}
      recipientName={recipientName}
      recipientAvatar={recipientAvatar}
      onToggleMute={onToggleMute}
      onToggleVideo={onToggleVideo}
      onToggleSpeaker={onToggleSpeaker}
      onToggleFullscreen={onToggleFullscreen}
      onEndCall={onEndCall}
      isMuted={isMuted}
      isVideoOn={isVideoOn}
      isSpeakerOn={isSpeakerOn}
      isFullscreen={isFullscreen}
      callDuration={callDuration}
      callType="video"
    >
      <div className="relative w-full h-full">
        {/* Remote Video */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                  {recipientAvatar ? (
                    <img src={recipientAvatar} alt={recipientName} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-4xl">{recipientName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold mb-1">{recipientName}</h2>
                <p className="text-gray-300">Calling...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        {localStream && isVideoOn && (
          <div className="absolute bottom-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </BaseCallDialog>
  );
}
