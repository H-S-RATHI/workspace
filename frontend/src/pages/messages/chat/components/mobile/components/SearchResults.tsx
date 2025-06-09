import React from 'react';
import { Plus } from 'lucide-react';
import { SearchResult, Conversation } from '../types';
import { 
  findExistingConversation, 
  getUserDisplayName, 
  getUserUsername, 
  getUserInitials 
} from '../utils/conversationUtils';
interface SearchResultsProps {
  searchQuery: string;
  searchResults: SearchResult[];
  conversations: Conversation[];
  currentUserId: string | undefined;
  onSelectExistingConversation: (convoId: string) => void;
  onStartNewChat: (userId: string) => void;
}
export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  searchResults,
  conversations,
  currentUserId,
  onSelectExistingConversation,
  onStartNewChat
}) => {
  if (!searchQuery.trim() || searchResults.length === 0) {
    return null;
  }
  return (
    <div className="border-b border-gray-200 bg-blue-50">
      <div className="px-4 py-2 text-xs font-medium text-blue-600 uppercase tracking-wider">
        Search Results
      </div>
      <div className="overflow-y-auto max-h-64">
        {searchResults.map((user) => {
          const isCurrentUser = user.userId === currentUserId;
          const existingConvo = findExistingConversation(conversations, user.userId, currentUserId);
          const displayName = getUserDisplayName(user, currentUserId);
          const username = getUserUsername(user, currentUserId);
          const initials = getUserInitials(user, currentUserId);
          
          const handleClick = () => {
            if (existingConvo) {
              onSelectExistingConversation(existingConvo.convoId);
            } else {
              onStartNewChat(user.userId);
            }
          };
          
          return (
            <div 
              key={user.userId}
              onClick={handleClick}
              className="px-4 py-3 hover:bg-blue-100 cursor-pointer flex items-center"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                isCurrentUser 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                {user.profilePhotoUrl && !isCurrentUser ? (
                  <img 
                    src={user.profilePhotoUrl} 
                    alt={displayName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  {existingConvo && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {isCurrentUser ? 'Your Notes' : 'Chat exists'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  @{username}
                </p>
              </div>
              <div className="text-blue-600 flex-shrink-0">
                {existingConvo ? (
                  <span className="text-xs text-gray-500">Open</span>
                ) : (
                  <Plus size={20} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};