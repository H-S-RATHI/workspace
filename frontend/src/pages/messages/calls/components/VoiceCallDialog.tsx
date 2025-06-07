import { BaseCallDialog } from './BaseCallDialog';
import { User } from 'lucide-react';

type VoiceCallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar?: string;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleFullscreen: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isFullscreen: boolean;
  callDuration: number;
};

export function VoiceCallDialog({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  onToggleMute,
  onToggleSpeaker,
  onToggleFullscreen,
  onEndCall,
  isMuted,
  isSpeakerOn,
  isFullscreen,
  callDuration,
}: VoiceCallDialogProps) {
  return (
    <BaseCallDialog
      isOpen={isOpen}
      onClose={onClose}
      recipientName={recipientName}
      recipientAvatar={recipientAvatar}
      onToggleMute={onToggleMute}
      onToggleSpeaker={onToggleSpeaker}
      onToggleFullscreen={onToggleFullscreen}
      onEndCall={onEndCall}
      isMuted={isMuted}
      isSpeakerOn={isSpeakerOn}
      isFullscreen={isFullscreen}
      callDuration={callDuration}
      callType="audio"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative mb-6">
          {recipientAvatar ? (
            <img
              src={recipientAvatar}
              alt={recipientName}
              className="h-32 w-32 rounded-full object-cover"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <User className="h-16 w-16 text-indigo-600 dark:text-indigo-300" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">{recipientName}</h2>
        <p className="text-gray-300">Call in progress</p>
      </div>
    </BaseCallDialog>
  );
}
