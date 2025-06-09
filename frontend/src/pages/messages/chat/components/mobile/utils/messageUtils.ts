import { format } from 'date-fns';
import type { Message } from '../../../../../../types/chat';
import { GroupedMessages } from '../types';
/**
 * Groups messages by date
 */
export const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
  console.log('Mobile - Grouping messages. Total messages:', messages?.length || 0);
  
  return messages.reduce<GroupedMessages>((acc, msg) => {
    if (!msg?.timestamp) return acc;
    
    try {
      const date = new Date(msg.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(msg);
      return acc;
    } catch (error) {
      console.error('Error processing message date:', error);
      return acc;
    }
  }, {});
};
/**
 * Creates a unique key for a message
 */
export const createMessageKey = (msg: Message, index: number): string => {
  return msg.messageId 
    ? `msg-${msg.messageId}`
    : `msg-${msg.timestamp}-${msg.senderId}-${index}`;
};
/**
 * Get other user ID from conversation members
 */
export const getOtherUserId = (
  conversation: any, 
  currentUserId: string
): string | null => {
  if (!conversation) return null;
  if (conversation.isGroup) return null;
  if (!conversation.members?.length) return null;
  
  // Find the member who is not the current user
  const otherMember = conversation.members.find(
    (member: any) => member.userId !== currentUserId
  );
  
  return otherMember?.userId || null;
};