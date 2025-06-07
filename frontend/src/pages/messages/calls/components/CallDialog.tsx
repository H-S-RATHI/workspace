import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Phone, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CallType } from '@/store/call/types';
import { VoiceCallDialog } from './VoiceCallDialog';
import { VideoCallDialog } from './VideoCallDialog';
import { useCallStore } from '@/store/call/store';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCallStart: (type: 'audio' | 'video') => void;
  recipientName: string;
  recipientAvatar?: string;
  callType?: 'audio' | 'video';
};

export function CallDialog({ 
  isOpen, 
  onClose, 
  onCallStart, 
  recipientName, 
  recipientAvatar,
  callType: initialCallType 
}: CallDialogProps) {
  const [callType, setCallType] = useState<CallType | null>(initialCallType || null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { activeCall, endCall } = useCallStore();
  
  // Update call type when initialCallType changes
  useEffect(() => {
    if (initialCallType) {
      setCallType(initialCallType);
      setIsVideoOn(initialCallType === 'video');
    }
  }, [initialCallType]);

  const endCallHandler = useCallback(() => {
    console.log('[CallDialog][endCallHandler] Ending call and cleaning up');
    
    // Stop the call timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Clean up media streams
    if (localStream) {
      console.log('[CallDialog][endCallHandler] Stopping local stream tracks');
      localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.error('[CallDialog][endCallHandler] Error stopping local track:', error);
        }
      });
      setLocalStream(null);
    }
    
    if (remoteStream) {
      console.log('[CallDialog][endCallHandler] Stopping remote stream tracks');
      remoteStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.error('[CallDialog][endCallHandler] Error stopping remote track:', error);
        }
      });
      setRemoteStream(null);
    }
    
    // Reset state
    console.log('[CallDialog][endCallHandler] Resetting call state');
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
    
    // Close the dialog
    console.log('[CallDialog][endCallHandler] Closing dialog');
    onClose();
  }, [activeCall, endCall, localStream, onClose, remoteStream, timer]);

  // Initialize call streams when dialog opens or call type changes
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let localStreamInstance: MediaStream | null = null;
    
    const initializeCall = async () => {
      if (!callType || !isOpen) return;
      
      try {
        // Request media permissions and get the stream
        const constraints = {
          audio: true,
          video: callType === 'video'
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamInstance = stream;
        setLocalStream(stream);
        
        // For demo purposes, we'll clone the stream for the remote
        // In a real app, you would set up WebRTC connections here
        setRemoteStream(stream.clone());
        
        // Start call duration timer
        const startTime = Date.now();
        timer = setInterval(() => {
          setCallDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Start the call
        onCallStart(callType);
      } catch (error) {
        console.error('Error initializing call streams:', error);
        toast.error('Failed to access camera/microphone. Please check your permissions.');
        endCallHandler();
      }
    };
    
    if (isOpen && callType) {
      initializeCall();
    }
    
    // Cleanup function
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      // Clean up streams if component unmounts
      if (localStreamInstance) {
        localStreamInstance.getTracks().forEach(track => track.stop());
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        setRemoteStream(null);
      }
    };
  }, [callType, isOpen, endCallHandler, onCallStart]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // If we're in a call, show the appropriate call UI
  if (callType === 'audio') {
    return (
      <VoiceCallDialog
        isOpen={isOpen}
        onClose={onClose}
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
        onClose={onClose}
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

  // Show call type selection if no call type is selected
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Start a call with {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-6 py-6">
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-3 h-28 w-28 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            onClick={() => {
              setCallType('audio');
              onCallStart('audio');
            }}
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
            onClick={() => {
              setCallType('video');
              onCallStart('video');
            }}
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">Video Call</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


