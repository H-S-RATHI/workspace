import { useState, useCallback, useEffect } from 'react';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCallStore } from '@/store/call/store';
import { useSocketStore } from '@/store/socket/store';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { CallDialog } from '../../calls/components/CallDialog';

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
  const [isTyping, setIsTyping] = useState(false);
  
  // Get data from stores
  const { currentConversation } = useChatStore();
  const { initiateCall } = useCallStore();
  const { socket } = useSocketStore();

  // Derive values from conversation
  const displayName = currentConversation?.displayName || 'Unknown User';
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

  // State for call dialog
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const [isCallInitiating, setIsCallInitiating] = useState(false);

  // Handle call start from dialog
  const handleCallStart = useCallback(async (type: 'audio' | 'video') => {
    // Prevent multiple initiations
    if (isCallInitiating || !currentConversation || !socket || !initiateCall) {
      if (!isCallInitiating) {
        toast.error('Unable to start call. Please try again.');
      }
      return;
    }

    // Prevent multiple clicks
    if (isCallInitiating) return;
    
    // Close the dialog immediately to prevent multiple clicks
    setIsCallDialogOpen(false);
    setIsCallInitiating(true);
    
    try {
      console.log(`[ChatHeader] Starting ${type} call to user ID:`, targetUserId);
      
      // Clear any existing call state
      const currentCall = useCallStore.getState().activeCall;
      if (currentCall) {
        console.log('[ChatHeader] Ending existing call before starting new one');
        useCallStore.getState().endCall(currentCall.callId);
        await new Promise(resolve => setTimeout(resolve, 300)); // Give time for cleanup
      }
      
      await initiateCall({
        targetUserId: targetUserId!,
        callType: type,
      });
    } catch (error) {
      console.error(`[ChatHeader] Failed to initiate ${type} call:`, error);
      toast.error(`Failed to start ${type} call`);
      
      // Reset the call state on error
      useCallStore.getState().endCall('any');
    } finally {
      // Add a small delay before allowing another call
      setTimeout(() => {
        setIsCallInitiating(false);
      }, 1000);
    }
  }, [currentConversation, socket, initiateCall, targetUserId, isCallInitiating]);

  // Open call dialog and set target user
  const openCallDialog = useCallback((type: 'audio' | 'video') => {
    // Prevent multiple clicks with debounce
    if (isCallInitiating) {
      console.log('[ChatHeader] Call initiation in progress, ignoring click');
      return;
    }
    
    if (!currentConversation) {
      toast.error('Please select a conversation first');
      return;
    }

    if (currentConversation.isGroup) {
      toast.error('Group calls are not yet supported');
      return;
    }

    // Get the target user ID from the conversation
    const currentUserId = useAuthStore.getState().user?.userId;
    const otherMember = currentConversation.members?.find(member => member.userId !== currentUserId);
    
    if (!otherMember?.userId) {
      toast.error('Could not identify the user to call');
      return;
    }

    setCallType(type);
    setTargetUserId(otherMember.userId);
    setIsCallDialogOpen(true);
  }, [currentConversation]);

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
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openCallDialog('audio');
            }}
            disabled={!currentConversation || !socket || isCallInitiating}
            className={cn(
              'p-2 rounded-full transition-all',
              (currentConversation && socket && !isCallInitiating) 
                ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 active:scale-95 transform'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
              isCallInitiating && 'opacity-50 cursor-wait animate-pulse'
            )}
            aria-label={isCallInitiating ? 'Starting call...' : (currentConversation && socket ? 'Start a call' : 'Select a conversation to call')}
            title={isCallInitiating ? 'Starting call...' : (currentConversation && socket ? 'Start a call' : 'Select a conversation to call')}
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openCallDialog('video');
            }}
            disabled={!currentConversation || !socket || isCallInitiating}
            className={cn(
              'p-2 rounded-full transition-all',
              (currentConversation && socket && !isCallInitiating) 
                ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700 active:scale-95 transform'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
              isCallInitiating && 'opacity-50 cursor-wait animate-pulse'
            )}
            aria-label={isCallInitiating ? 'Starting call...' : (currentConversation && socket ? 'Start a video call' : 'Select a conversation to call')}
            title={currentConversation && socket ? 'Start a video call' : 'Select a conversation to call'}
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        {targetUserId && callType && (
          <CallDialog
            isOpen={isCallDialogOpen}
            onClose={() => {
              setIsCallDialogOpen(false);
              setCallType(null);
            }}
            onCallStart={handleCallStart}
            recipientName={currentConversation?.displayName || 'Unknown User'}
            recipientAvatar={currentConversation?.displayPhoto}
            callType={callType}
          />
        )}

        <button
          onClick={handleSearchClick}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={handleMenuClick}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Menu"
        >
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
