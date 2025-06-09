import { Conversation } from '../types';
/**
 * Find an existing conversation with a specific user
 */
export const findExistingConversation = (
  conversations: Conversation[], 
  userId: string, 
  currentUserId: string | undefined
): Conversation | undefined => {
  if (!currentUserId) return undefined;
  
  return conversations.find(conv => {
    // Skip group chats
    if (conv.isGroup) return false;
    
    const memberIds = conv.members?.map(m => m.userId) || [];
    
    // For self-chat (talking to yourself)
    if (userId === currentUserId) {
      return memberIds.length === 1 && memberIds[0] === currentUserId;
    }
    
    // For conversations with other users
    return memberIds.includes(userId) && memberIds.includes(currentUserId);
  });
};
/**
 * Get display name for a conversation
 */
export const getConversationDisplayName = (
  conversation: Conversation, 
  currentUserId: string | undefined
): string => {
  if (conversation.members?.length === 1 && conversation.members[0].userId === currentUserId) {
    return 'You';
  }
  return conversation.displayName || 'Unknown';
};
/**
 * Get display name for a search result user
 */
export const getUserDisplayName = (
  user: { userId: string; fullName?: string }, 
  currentUserId: string | undefined
): string => {
  const isCurrentUser = user.userId === currentUserId;
  return isCurrentUser ? 'Your Notes' : user.fullName || 'Unknown User';
};
/**
 * Get username for display
 */
export const getUserUsername = (
  user: { userId: string; username?: string }, 
  currentUserId: string | undefined
): string => {
  const isCurrentUser = user.userId === currentUserId;
  return isCurrentUser ? 'notes' : user.username || 'unknown';
};
/**
 * Get user initials for avatar
 */
export const getUserInitials = (
  user: { userId: string; fullName?: string }, 
  currentUserId: string | undefined
): string => {
  const isCurrentUser = user.userId === currentUserId;
  if (isCurrentUser) return 'Y';
  return user.fullName?.charAt(0).toUpperCase() || 'U';
};
/**
 * Format time for display
 */
export const formatMessageTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};