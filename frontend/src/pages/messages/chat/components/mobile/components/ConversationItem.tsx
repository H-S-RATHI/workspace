import React from 'react';
import { Conversation } from '../types';
import { getConversationDisplayName, formatMessageTime } from '../utils/conversationUtils';
interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string | undefined;
  isSelected: boolean;
  onClick: () => void;
}
export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  isSelected,
  onClick
}) => {
  const displayName = getConversationDisplayName(conversation, currentUserId);
  const messageTime = formatMessageTime(conversation.lastMessageAt);
  return (
    <div 
      onClick={onClick}
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-white font-medium">
            {conversation.displayName?.charAt(0).toUpperCase() || 'C'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {messageTime}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate mt-1">
            {conversation.lastMessage?.contentText || 'No messages yet'}
          </p>
        </div>
        {conversation.unreadCount > 0 && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};