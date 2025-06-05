import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useChatStore } from '../../../../store/chat';
import { useAuthStore } from '../../../../store/auth';
import { useSocketStore } from '../../../../store/socket';
import { Button } from '../../../../components/ui/Button';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../../../types/chat';

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className = '' }) => {
  // Get necessary state and actions from stores
  const {
    currentConversation,
    messages = [],
    sendMessage: sendMessageAction,
    isSending = false,
    hasMoreMessages = false,
    isFetchingMore = false,
    loadMoreMessages
  } = useChatStore();
  
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.userId || '';
  const socket = useSocketStore((state) => state.socket);
  
  // Local state
  const [message, setMessage] = useState('');
  
  // Refs for scroll handling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = useRef(true);
  const prevMessagesLength = useRef(messages.length);
  const isInitialLoad = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Memoize the other user from the conversation
  const otherUser = useMemo(() => {
    if (!currentConversation?.members) return undefined;
    return currentConversation.members.find((user) => user.userId !== currentUserId);
  }, [currentConversation?.members, currentUserId]);
  
  // Handle scroll events to detect user scrolling up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100; // 100px threshold
    isScrolledToBottom.current = isAtBottom;
    
    // Load more messages when scrolling near the top
    if (scrollTop < 100 && hasMoreMessages && !isFetchingMore) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isFetchingMore, loadMoreMessages]);
  
  // Auto-scroll to bottom when new messages arrive and user is at bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && isScrolledToBottom.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Handle initial load and new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      // On initial load, scroll to bottom immediately
      setTimeout(() => scrollToBottom('auto'), 0);
      isInitialLoad.current = false;
    } else if (prevMessagesLength.current < messages.length) {
      // New message added, scroll to bottom if user is at bottom
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, scrollToBottom]);
  
  // Set up scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !currentConversation) return;
    
    try {
      await sendMessageAction(message); // Just pass the message string
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, isSending, currentConversation, sendMessageAction]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !currentConversation) return;
    
    socket.emit('typing', {
      conversationId: currentConversation.convoId,
      userId: currentUserId
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && currentConversation) {
        socket.emit('stop_typing', {
          conversationId: currentConversation.convoId,
          userId: currentUserId
        });
      }
    }, 2000); // Stop typing after 2 seconds of inactivity
  }, [socket, currentConversation, currentUserId]);

  // Debug log to check messages and current conversation
  useEffect(() => {
    console.log('ChatWindow - Current User ID:', currentUserId);
    console.log('ChatWindow - Messages:', messages);
    console.log('ChatWindow - Current Conversation:', currentConversation);
  }, [messages, currentConversation, currentUserId]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    console.log('Grouping messages. Total messages:', messages?.length || 0);
    return (messages || []).reduce<Record<string, Message[]>>((acc, msg: Message) => {
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
  }, [messages]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!currentConversation) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-gray-500 text-center p-6 max-w-md">
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-sm">Select a conversation or start a new one to begin messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {otherUser?.fullName || otherUser?.username || 'Chat'}
            </h2>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <PhoneIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <VideoCameraIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gray-200 text-xs text-gray-600 px-2 py-1 rounded-full">
                {format(new Date(date), 'MMMM d, yyyy')}
              </div>
            </div>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.messageId}
                message={msg}
                isCurrentUser={msg.senderId === currentUserId}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button type="submit" disabled={!message.trim() || isSending}>
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.144c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H3.75A2.25 2.25 0 0 0 1.5 4.5v2.25Z"
    />
  </svg>
);

const VideoCameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

export default ChatWindow;
