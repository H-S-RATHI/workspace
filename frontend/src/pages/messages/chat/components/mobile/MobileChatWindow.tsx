import React, { useMemo, useEffect } from 'react';
import { useChatStore } from '../../../../../store/chat';
import { useAuthStore } from '../../../../../store/auth';
import { CallDialog } from '../../../calls/components/CallDialog';
import { MobileChatWindowProps } from './types';
import { groupMessagesByDate, getOtherUserId } from './utils/messageUtils';
import { useScrollManagement } from './hooks/useScrollManagement';
import { useCallHandling } from './hooks/useCallHandling';
import { useMessageHandling } from './hooks/useMessageHandling';
import {
  ChatHeader,
  MessagesArea,
  MessageInput,
  EmptyConversationState
} from './components';
const MobileChatWindow: React.FC<MobileChatWindowProps> = ({ onBack }) => {
  const { 
    currentConversation,
    messages = [],
    sendMessage: sendMessageAction,
    isSending = false,
    hasMoreMessages = false,
    isFetchingMore = false,
    loadMoreMessages,
    fetchMessages,
    error: chatError
  } = useChatStore();
  
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.userId || '';
  
  // Get the other user's ID from conversation members for direct messages
  const otherUserId = useMemo(() => 
    getOtherUserId(currentConversation, currentUserId), 
    [currentConversation, currentUserId]
  );
  // Custom hooks
  const scrollManagement = useScrollManagement({
    messages,
    hasMoreMessages,
    isFetchingMore,
    loadMoreMessages
  });
  const callHandling = useCallHandling({ otherUserId });
  const messageHandling = useMessageHandling({
    currentConversation,
    isSending,
    sendMessageAction,
    fetchMessages
  });
  // Group messages by date
  const groupedMessages = useMemo(() => 
    groupMessagesByDate(messages), 
    [messages]
  );
  // Debug log to check messages and current conversation
  useEffect(() => {
    console.log('Mobile - Current Conversation:', currentConversation);
    console.log('Mobile - Messages:', messages);
  }, [currentConversation, messages]);
  if (!currentConversation) {
    return <EmptyConversationState onBack={onBack} />;
  }
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <ChatHeader
        currentConversation={currentConversation}
        otherUserId={otherUserId}
        isCallInProgress={callHandling.isCallInProgress}
        isCallActive={callHandling.isCallActive}
        onBack={onBack}
        onCallStart={callHandling.handleCallStart}
        onEndCall={callHandling.handleEndCall}
      />
      
      {/* Call Dialog */}
      {callHandling.isCallDialogOpen && (
        <CallDialog 
          isOpen={callHandling.isCallDialogOpen}
          onClose={() => callHandling.setIsCallDialogOpen(false)}
          onCallStart={callHandling.handleCallStart}
          recipientName={currentConversation?.displayName || 'User'}
        />
      )}
      
      {/* Messages area */}
      <MessagesArea
        groupedMessages={groupedMessages}
        currentUserId={currentUserId}
        messagesContainerRef={scrollManagement.messagesContainerRef}
        messagesEndRef={scrollManagement.messagesEndRef}
      />
      
      {/* Message input */}
      <MessageInput
        message={messageHandling.message}
        setMessage={messageHandling.setMessage}
        onSendMessage={messageHandling.handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
};
export default MobileChatWindow;