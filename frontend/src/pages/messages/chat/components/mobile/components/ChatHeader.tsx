import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, PhoneOff } from 'lucide-react';
import { useSocketStore } from '@/store/socket/store';
import { CallType } from '../types';
interface ChatHeaderProps {
  currentConversation: any;
  otherUserId: string | null;
  isCallInProgress: boolean;
  isCallActive: boolean;
  onBack: () => void;
  onCallStart: (type: CallType) => Promise<void>;
  onEndCall: () => void;
}
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentConversation,
  otherUserId,
  isCallInProgress,
  isCallActive,
  onBack,
  onCallStart,
  onEndCall
}) => {
  const navigate = useNavigate();
  const { socket } = useSocketStore();
  const handleUserNameClick = () => {
    console.log('MobileChatWindow - Clicked on user name:', {
      displayName: currentConversation.displayName,
      isGroup: currentConversation.isGroup,
      otherUserId,
      allProps: currentConversation
    });
    
    // For direct conversations, use the other user's ID
    // For group chats, we don't have a single user to link to
    if (!currentConversation.isGroup && otherUserId) {
      console.log('Mobile - Navigating to profile:', `/profile/${otherUserId}`);
      navigate(`/profile/${otherUserId}`);
    } else {
      console.log('Mobile - Not navigating - reason:', 
        currentConversation.isGroup ? 'This is a group chat' : 'No other user ID available');
    }
  };
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center">
      <button 
        onClick={onBack}
        className="p-2 hover:bg-white/20 rounded-full transition-colors mr-3"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
        <span className="text-white font-semibold">
          {currentConversation.displayName?.charAt(0).toUpperCase() || 'C'}
        </span>
      </div>
      
      <div 
        className="flex-1 cursor-pointer" 
        onClick={handleUserNameClick}
      >
        <h3 className="font-semibold text-lg hover:underline">
          {currentConversation.displayName}
          {currentConversation.isGroup && ' (Group)'}
        </h3>
        <p className="text-xs text-white/80">Online</p>
      </div>
      
      <div className="flex items-center space-x-2">
        {isCallInProgress || isCallActive ? (
          <button 
            onClick={onEndCall}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        ) : (
          <>
            <button 
              onClick={() => onCallStart('audio')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Voice call"
              disabled={!socket?.connected}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onCallStart('video')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Video call"
              disabled={!socket?.connected}
            >
              <Video className="w-5 h-5" />
            </button>
            <button 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};