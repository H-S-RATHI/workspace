import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/timeUtils';
import { Minimize2, Maximize2, Video, VideoOff, Mic, MicOff, Phone, Volume2, VolumeX } from 'lucide-react';

type BaseCallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar?: string;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
  onToggleSpeaker: () => void;
  onToggleFullscreen: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn?: boolean;
  isSpeakerOn: boolean;
  isFullscreen: boolean;
  callDuration: number;
  callType: 'audio' | 'video';
  children?: ReactNode;
};

export function BaseCallDialog({
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
  isVideoOn = true,
  isSpeakerOn,
  isFullscreen,
  callDuration,
  callType,
  children,
}: BaseCallDialogProps) {
  // Common UI and logic for both call types
  const handleDialogClose = () => {
    onEndCall();
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={handleDialogClose}
    >
      <div 
        className={`relative flex flex-col w-full h-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${isFullscreen ? 'w-screen h-screen max-w-none rounded-none' : 'max-h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={recipientName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {recipientName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{recipientName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {children || (
            <div className="text-center text-white">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                {recipientAvatar ? (
                  <img src={recipientAvatar} alt={recipientName} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-4xl text-white">{recipientName[0]?.toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-2xl font-semibold mb-1">{recipientName}</h2>
              <p className="text-gray-300">Calling...</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-black/50 flex justify-center space-x-6">
          {callType === 'video' && onToggleVideo && (
            <Button
              variant={isVideoOn ? 'secondary' : 'outline'}
              size="icon"
              onClick={onToggleVideo}
              className="rounded-full w-12 h-12"
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
          )}
          
          <Button
            variant={isMuted ? 'outline' : 'secondary'}
            size="icon"
            onClick={onToggleMute}
            className="rounded-full w-12 h-12"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onEndCall}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
          >
            <Phone className="w-6 h-6 transform rotate-[135deg]" />
          </Button>
          
          <Button
            variant={isSpeakerOn ? 'secondary' : 'outline'}
            size="icon"
            onClick={onToggleSpeaker}
            className="rounded-full w-12 h-12"
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
