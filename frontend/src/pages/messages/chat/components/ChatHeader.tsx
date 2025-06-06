import { useState, useCallback, useEffect } from 'react';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import { useCallStore } from '@/store/call/store';
import { useSocketStore } from '@/store/socket/store';
import { useChatStore } from '@/store/chatStore';
import { CallDialog } from './CallDialog';

// Utility function to merge class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export type UserStatus = 'online' | 'offline' | 'typing';

export interface ChatHeaderProps {
  /** Optional class name for the root element */
  className?: string;
}

export const ChatHeader = ({ className = '' }: ChatHeaderProps) => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Get data from stores
  const { currentConversation } = useChatStore();
  const { initiateCall } = useCallStore();
  const { socket } = useSocketStore();

  // Derive values from conversation
  const displayName = currentConversation?.displayName || 'Unknown User';
  const userId = currentConversation?.userId || '';
  const avatarUrl = currentConversation?.displayPhoto;
  const status: UserStatus = isTyping ? 'typing' : 'online';

  // Simulate typing indicator for demo purposes
  useEffect(() => {
    if (!currentConversation) return;
    
    let timeout: ReturnType<typeof setTimeout>;
    
    // In a real app, this would come from WebSocket events
    const typingTimeout = Math.random() * 3000 + 1000; // 1-4 seconds
    timeout = setTimeout(() => {
      setIsTyping(false);
    }, typingTimeout);
    
    setIsTyping(true);
    
    return () => clearTimeout(timeout);
  }, [currentConversation?.convoId]); // Re-run when conversation changes

  const handleMenuClick = useCallback(() => {
    console.log('Menu clicked');
  }, []);

  const handleSearchClick = useCallback(() => {
    console.log('Search clicked');
  }, []);

  // Handle call start
  const handleCallStart = useCallback(async (type: 'audio' | 'video') => {
    if (!userId) {
      console.error('[ChatHeader] Cannot start call: No user ID provided');
      return;
    }

    if (!socket) {
      console.error('[ChatHeader] Cannot start call: WebSocket connection not available');
      return;
    }

    try {
      if (!initiateCall) {
        throw new Error('initiateCall function is not available');
      }
      
      await initiateCall({
        targetUserId: userId,
        callType: type,
      });
      setIsCallDialogOpen(false);
    } catch (error) {
      console.error('[ChatHeader] Failed to initiate call:', error);
    }
  }, [userId, socket, initiateCall]);

  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700', className)}>
      {/* User info section */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              status === 'online' ? 'bg-green-500' : 'bg-gray-300',
              status === 'typing' && 'animate-pulse',
              'transition-colors duration-200'
            )}
            aria-label={status === 'typing' ? 'typing...' : status}
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{displayName}</h3>
          <p className="text-xs text-gray-500">
            {isTyping ? 'typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleCallStart('audio')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Start voice call"
          disabled={!socket}
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsCallDialogOpen(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Start video call"
          disabled={!socket}
        >
          <Video className="w-5 h-5" />
        </button>

        <CallDialog
          isOpen={isCallDialogOpen}
          onClose={() => setIsCallDialogOpen(false)}
          onCallStart={handleCallStart}
          recipientName={displayName}
          recipientAvatar={avatarUrl}
        />

        <button
          onClick={handleMenuClick}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Menu"
        >
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={handleSearchClick}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
