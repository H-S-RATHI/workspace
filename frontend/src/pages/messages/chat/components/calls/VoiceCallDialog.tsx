import { Phone, Mic, MicOff, Volume2, VolumeX, X, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/timeUtils';

type VoiceCallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar?: string;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
};

export function VoiceCallDialog({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
  isMuted,
  isSpeakerOn,
  callDuration,
}: VoiceCallDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            {formatDuration(callDuration)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Caller Info */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative mb-4">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <User className="h-12 w-12 text-indigo-600 dark:text-indigo-300" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {recipientName}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          </p>
        </div>

        {/* Call Controls */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-b-2xl">
          <div className="flex justify-center gap-4">
            <Button
              variant={isMuted ? 'outline' : 'secondary'}
              size="icon"
              className="rounded-full h-14 w-14"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant={isSpeakerOn ? 'secondary' : 'outline'}
              size="icon"
              className="rounded-full h-14 w-14"
              onClick={onToggleSpeaker}
              aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            >
              {isSpeakerOn ? (
                <Volume2 className="h-6 w-6" />
              ) : (
                <VolumeX className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-14 w-14"
              onClick={onEndCall}
              aria-label="End call"
            >
              <Phone className="h-6 w-6 transform rotate-135" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
