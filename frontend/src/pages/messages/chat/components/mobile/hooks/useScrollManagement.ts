import { useRef, useEffect, useCallback } from 'react';
import { SCROLL_THRESHOLD, LOAD_MORE_THRESHOLD, AUTO_SCROLL_DELAY } from '../constants';
interface UseScrollManagementProps {
  messages: any[];
  hasMoreMessages: boolean;
  isFetchingMore: boolean;
  loadMoreMessages: () => void;
}
export const useScrollManagement = ({
  messages,
  hasMoreMessages,
  isFetchingMore,
  loadMoreMessages
}: UseScrollManagementProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottom = useRef(true);
  const prevMessagesLength = useRef(messages.length);
  const isInitialLoad = useRef(true);
  // Handle scroll events to detect user scrolling up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD;
    isScrolledToBottom.current = isAtBottom;
    
    // Load more messages when scrolling near the top
    if (scrollTop < LOAD_MORE_THRESHOLD && hasMoreMessages && !isFetchingMore) {
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
      setTimeout(() => scrollToBottom('auto'), AUTO_SCROLL_DELAY);
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
  return {
    messagesEndRef,
    messagesContainerRef,
    handleScroll,
    scrollToBottom
  };
};