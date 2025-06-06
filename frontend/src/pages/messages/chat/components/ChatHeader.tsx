import { useState } from 'react';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import { cn } from './utils';
import { CallDialog } from './CallDialog';
import { useCallStore } from '@/store/call';
import { useAuthStore } from '@/store/auth';

interface ChatHeaderProps {
  name: string;
  userId: string;
  status: 'online' | 'offline' | 'typing';
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export const ChatHeader = ({
  name,
  userId,
  status = 'online',
  onMenuClick,
  onSearchClick,
}: ChatHeaderProps) => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const { initiateCall } = useCallStore();
  // User will be used for future enhancements like caller info
  const { user: _user } = useAuthStore();

  const handleCallStart = async (type: 'audio' | 'video') => {
    console.log('handleCallStart called with type:', type, 'for user:', userId);
    if (!userId) {
      console.error('Cannot start call: No user ID provided');
      return;
    }
    
    try {
      console.log('Initiating call to user:', userId, 'type:', type);
      const result = await initiateCall({
        targetUserId: userId,
        callType: type,
      });
      console.log('Call initiated successfully:', result);
      setIsCallDialogOpen(false);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {name.charAt(0).toUpperCase()}
          </div>
          <span 
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              status === 'online' ? 'bg-green-500' : 'bg-gray-300',
              status === 'typing' && 'animate-pulse'
            )} 
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
          <p className="text-xs text-gray-500">
            {status === 'typing' 
              ? 'typing...' 
              : status === 'online' 
                ? 'Online' 
                : 'Offline'
            }
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => handleCallStart('audio')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Start voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setIsCallDialogOpen(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Video className="w-5 h-5" />
        </button>
        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => setIsCallDialogOpen(false)}
          onCallStart={handleCallStart}
          recipientName={name}
        />
        <button 
          onClick={onSearchClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Search messages"
        >
          <Search className="w-5 h-5" />
        </button>
        <button 
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
