import { useRef, useState, useCallback, useEffect } from 'react';
import { Smile, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';

// Emoji data
const EMOJIS = ['😀', '😂', '😍', '😎', '👍', '❤️', '🔥', '🎉', '🙏', '👋'];

interface ChatInputProps {
  onTypingChange?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onTypingChange
}) => {
  const { sendMessage, isSending } = useChatStore();
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle message change with typing indicator
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
    if (onTypingChange) {
      onTypingChange(value.trim().length > 0);
    }
  }, [onTypingChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;
    
    try {
      await sendMessage(trimmedMessage);
      setMessage('');
      setIsEmojiPickerOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, isSending, sendMessage]);
  
  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  }, []);
  
  // Toggle emoji picker
  const toggleEmojiPicker = useCallback(() => {
    setIsEmojiPickerOpen(prev => !prev);
  }, []);

  // Auto-resize textarea and handle keyboard events
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [message]);

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEmojiPickerOpen && formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEmojiPickerOpen]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end space-x-3"
      >
        <button 
          type="button" 
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          onClick={toggleEmojiPicker}
          aria-label="Select emoji"
          aria-expanded={isEmojiPickerOpen}
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            className="w-full min-h-[44px] max-h-40 px-4 py-3 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            rows={1}
            aria-label="Message input"
          />
          
          {/* Emoji picker */}
          <AnimatePresence>
            {isEmojiPickerOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 left-0 w-64 h-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 overflow-y-auto z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-2xl hover:bg-gray-100 rounded p-1"
                      onClick={() => handleEmojiSelect(emoji)}
                      aria-label={`Select ${emoji} emoji`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          type="submit" 
          disabled={!message.trim() || isSending}
          className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
