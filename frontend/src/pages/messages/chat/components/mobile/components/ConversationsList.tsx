import React from 'react';
import { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';
import { EmptyMessagesState } from './EmptyMessagesState';
interface ConversationsListProps {
  conversations: Conversation[];
  currentConversation?: Conversation | null;
  currentUserId: string | undefined;
  isLoading: boolean;
  error?: string | null;
  onConversationSelect: (convoId: string) => void;
}
export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  currentConversation,
  currentUserId,
  isLoading,
  error,
  onConversationSelect
}) => {
  if (!isLoading && error && conversations.length === 0) {
    return <EmptyMessagesState hasError={true} />;
  }
  if (conversations.length === 0) {
    return <EmptyMessagesState />;
  }
  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.convoId}
          conversation={conversation}
          currentUserId={currentUserId}
          isSelected={currentConversation?.convoId === conversation.convoId}
          onClick={() => onConversationSelect(conversation.convoId)}
        />
      ))}
    </div>
  );
};