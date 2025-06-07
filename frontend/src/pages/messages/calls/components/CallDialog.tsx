import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Phone, Video } from 'lucide-react';
import { VoiceCallDialog } from './VoiceCallDialog';
import { VideoCallDialog } from './VideoCallDialog';
import { useCallStore } from '@/store/call/store';

type CallType = 'audio' | 'video' | null;

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCallStart: (type: 'audio' | 'video') => void;
  recipientName: string;
  recipientAvatar?: string;
};

export function CallDialog({ 
  isOpen, 
  onClose, 
  onCallStart, 
  recipientName, 
  recipientAvatar 
}: CallDialogProps) {
  const [callType, setCallType] = useState<CallType>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const { activeCall, endCall } = useCallStore();

  const endCallHandler = useCallback(() => {
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    // Reset state
    setCallType(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOn(true);
    setIsSpeakerOn(true);
    setIsFullscreen(false);
    
    // End the call in the store
    if (activeCall) {
      endCall(activeCall.callId);
    }
    
    onClose();
  }, [activeCall, endCall, localStream, onClose, remoteStream]);

  // Initialize call streams when call starts
  useEffect(() => {
    if (callType && isOpen) {
      let timer: NodeJS.Timeout;
      
      try {
        // For demo purposes, we'll just create empty streams
        // In a real app, you would set up WebRTC connections here
        const stream = new MediaStream();
        setLocalStream(stream);
        setRemoteStream(stream.clone());
        
        const startTime = Date.now();
        
        // Start call duration timer
        timer = setInterval(() => {
          setCallDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
      } catch (error) {
        console.error('Error initializing call streams:', error);
        endCallHandler();
      }
      
      // Cleanup function
      return () => {
        if (timer) {
          clearInterval(timer);
        }
        // Clean up streams if component unmounts
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
          remoteStream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [callType, isOpen, endCallHandler, localStream, remoteStream]);

  const handleCallStart = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsVideoOn(type === 'video');
    onCallStart(type);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, you would mute the audio track here
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In a real app, you would enable/disable the video track here
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real app, you would toggle the audio output device here
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // If we're in a call, show the appropriate call UI
  if (callType === 'audio') {
    return (
      <VoiceCallDialog
        isOpen={isOpen}
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
        onToggleMute={handleToggleMute}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleFullscreen={handleToggleFullscreen}
        onEndCall={endCallHandler}
        isMuted={isMuted}
        isSpeakerOn={isSpeakerOn}
        isFullscreen={isFullscreen}
        callDuration={callDuration}
      />
    );
  }

  if (callType === 'video') {
    return (
      <VideoCallDialog
        isOpen={isOpen}
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleFullscreen={handleToggleFullscreen}
        onEndCall={endCallHandler}
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isSpeakerOn={isSpeakerOn}
        isFullscreen={isFullscreen}
        callDuration={callDuration}
        localStream={localStream}
        remoteStream={remoteStream}
      />
    );
  }

  // Show call type selection dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Start a call with {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-6 py-6">
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-3 h-28 w-28 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            onClick={() => handleCallStart('audio')}
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">Voice Call</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-3 h-28 w-28 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            onClick={() => handleCallStart('video')}
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">Video Call</span>
          </Button>
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          Choose a call type to start connecting
        </div>
      </DialogContent>
    </Dialog>
  );
}
