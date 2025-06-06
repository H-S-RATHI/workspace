import React, { RefObject } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DateHeader } from './DateHeader';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './MessageArea';
import type { Message } from '../../../../types/chat';

interface MessageListProps {
  groupedMessages: Record<string, Message[]>;
  currentUserId: string;
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ groupedMessages, currentUserId, isTyping, messagesEndRef }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    <AnimatePresence>
      {Object.keys(groupedMessages).length === 0 ? null : (
        Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={`date-${date}`} className="mb-4">
            <DateHeader date={date} />
            {dateMessages
              .filter((msg) => msg && msg.contentText && msg.contentText.trim() !== '')
              .map((msg, index) => {
                // Generate a unique key using messageId, timestamp, senderId and index as fallback
                const messageKey = `msg-${msg.messageId || ''}-${msg.timestamp || ''}-${msg.senderId || 'unknown'}-${index}`;
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
      {isTyping && <TypingIndicator key="typing-indicator" />}
      <div ref={messagesEndRef} />
    </AnimatePresence>
  </div>
); 