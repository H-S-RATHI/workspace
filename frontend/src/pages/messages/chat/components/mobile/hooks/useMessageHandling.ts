import { useState, useCallback, useEffect, useRef } from 'react';
interface UseMessageHandlingProps {
  currentConversation: any;
  isSending: boolean;
  sendMessageAction: (message: string) => Promise<void>;
  fetchMessages: (convoId: string) => Promise<void>;
}
export const useMessageHandling = ({
  currentConversation,
  isSending,
  sendMessageAction,
  fetchMessages
}: UseMessageHandlingProps) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  return {
    message,
    setMessage,
    handleSendMessage
  };
};