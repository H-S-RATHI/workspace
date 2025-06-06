import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useChatStore } from '../../../../store/chat';
import { useAuthStore } from '../../../../store/auth';
import { MessageBubble } from './MessageBubble';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../../../types/chat';
import { useSocketStore } from '@/store/socket/store';
import { useCallStore } from '@/store/call/store';

// Simple DateHeader component
type DateHeaderProps = {
  date: string;
};

const DateHeader = ({ date }: DateHeaderProps) => {
  try {
    const dateObj = parseISO(date);
    let displayDate: string;
    
    if (isToday(dateObj)) {
      displayDate = 'Today';
    } else if (isYesterday(dateObj)) {
      displayDate = 'Yesterday';
    } else {
      displayDate = format(dateObj, 'MMMM d, yyyy');
    }
    
    return (
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-3 text-xs text-gray-500 font-medium">
          {displayDate}
        </span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
    );
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

interface MobileChatWindowProps {
  onBack: () => void
}

const MobileChatWindow = ({ onBack }: MobileChatWindowProps) => {
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
  const { socket } = useSocketStore();
  const { 
    activeCall, 
    initiateCall, 
    endCall, 
    isCallInProgress,
    isCallActive
  } = useCallStore();
  const navigate = useNavigate();
  const currentUserId = currentUser?.userId || '';
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  
  // Load messages when currentConversation changes
  useEffect(() => {
    if (currentConversation?.convoId) {
      console.log('Mobile - Current conversation changed, loading messages:', currentConversation.convoId);
      fetchMessages(currentConversation.convoId).catch(error => {
        console.error('Mobile - Error loading messages:', error);
      });
    } else {
      console.log('Mobile - No conversation selected or missing convoId');
    }
  }, [currentConversation?.convoId, fetchMessages]);
  
  // Get the other user's ID from conversation members for direct messages
  const otherUserId = useMemo(() => {
    if (!currentConversation) return null;
    if (currentConversation.isGroup) return null;
    if (!currentConversation.members?.length) return null;
    
    // Find the member who is not the current user
    const otherMember = currentConversation.members.find(
      member => member.userId !== currentUserId
    );
    
    return otherMember?.userId || null;
  }, [currentConversation, currentUserId]);

  // Handle starting a call
  const handleCallStart = useCallback(async (type: 'audio' | 'video') => {
    if (!otherUserId) {
      console.error('Cannot start call: No target user ID');
      return;
    }

    console.log('[MobileChatWindow] Starting', type, 'call to user:', otherUserId);
    
    try {
      await initiateCall({
        targetUserId: otherUserId,
        callType: type,
      });
      setIsCallDialogOpen(false);
    } catch (error) {
      console.error('Failed to start call:', error);
      // Handle error (show toast, etc.)
    }
  }, [otherUserId, initiateCall]);

  // Handle ending a call
  // Handle ending a call
  const handleEndCall = useCallback(() => {
    if (activeCall?.callId) {
      endCall(activeCall.callId);
    }
  }, [activeCall, endCall]);
  
  // Open call dialog
  const handleCallButtonClick = useCallback(() => {
    if (!otherUserId) {
      console.error('Cannot start call: No target user ID');
      return;
    }
    setIsCallDialogOpen(true);
  }, [otherUserId]);
  const [message, setMessage] = useState('');
  
  // Refs for scroll handling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = useRef(true);
  const prevMessagesLength = useRef(messages.length);
  const isInitialLoad = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Debug log to check messages and current conversation
  useEffect(() => {
    console.log('Mobile - Current Conversation:', currentConversation);
    console.log('Mobile - Messages:', messages);
  }, [currentConversation, messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    console.log('Mobile - Grouping messages. Total messages:', messages?.length || 0);
    return messages.reduce<Record<string, Message[]>>((acc, msg) => {
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
  }, [messages]);

  // Typing indicator handler (placeholder - implement with socket.io)
  const handleTyping = useCallback(() => {
    if (!currentConversation) return;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // You can add socket.emit('typing', ...) here if needed
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      // You can add socket.emit('stop_typing', ...) here if needed
    }, 2000);
  }, [currentConversation]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !currentConversation) return;
    
    try {
      await sendMessageAction(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, isSending, currentConversation, sendMessageAction]);
  
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
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500">No conversation selected</p>
          <button onClick={onBack} className="mt-2 text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
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
          onClick={() => {
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
          }}
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
              onClick={handleEndCall}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              aria-label="End call"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleCallStart('audio')}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Voice call"
                disabled={!socket?.connected}
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleCallStart('video')}
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
      
      {/* Call Dialog */}
      {isCallDialogOpen && (
        <CallDialog 
          isOpen={isCallDialogOpen}
          onClose={() => setIsCallDialogOpen(false)}
          onCallStart={handleCallStart}
          recipientName={currentConversation?.displayName || 'User'}
        />
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-md">
              Start the conversation by sending your first message
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={`date-${date}`} className="mb-4">
              <DateHeader date={date} />
              {dateMessages.map((msg, index) => {
                // Create a unique key using messageId + timestamp + index as fallback
                const messageKey = msg.messageId 
                  ? `msg-${msg.messageId}`
                  : `msg-${msg.timestamp}-${msg.senderId}-${index}`;
                
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
      {/* Message input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={!message.trim() || isSending}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default MobileChatWindow