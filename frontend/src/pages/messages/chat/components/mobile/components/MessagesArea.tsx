import React from 'react';
import { MessageBubble } from '../../desktop/MessageBubble';
import { DateHeader } from './DateHeader';
import { EmptyMessagesState } from './EmptyMessagesState';
import { GroupedMessages } from '../types';
import { createMessageKey } from '../utils/messageUtils';
interface MessagesAreaProps {
  groupedMessages: GroupedMessages;
  currentUserId: string;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}
export const MessagesArea: React.FC<MessagesAreaProps> = ({
  groupedMessages,
  currentUserId,
  messagesContainerRef,
  messagesEndRef
}) => {
  const hasMessages = Object.keys(groupedMessages).length > 0;
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white"
    >
      {!hasMessages ? (
        <EmptyMessagesState />
      ) : (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={`date-${date}`} className="mb-4">
            <DateHeader date={date} />
            {dateMessages.map((msg, index) => {
              const messageKey = createMessageKey(msg, index);
              
              return (
                <MessageBubble
                  key={messageKey}
                  message={msg}
                  isCurrentUser={msg.senderId === currentUserId}
                />
              );
            })}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};