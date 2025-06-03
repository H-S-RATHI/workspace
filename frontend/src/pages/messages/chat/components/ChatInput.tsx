import { useRef, useState, useEffect } from 'react';
import { Paperclip, Smile, Send } from 'lucide-react';
import { cn } from './utils';

interface ChatInputProps {
  message: string;
  isSending: boolean;
  onMessageChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onAttachFile: () => void;
}

export const ChatInput = ({
  message,
  isSending,
  onMessageChange,
  onSend,
  onAttachFile
}: ChatInputProps) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Common emojis for the emoji picker
  const emojis = ['😀', '😂', '😍', '👍', '❤️', '🔥', '🎉', '🙏'];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // reset to min height
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 dark:border-gray-700">
      <form onSubmit={onSend} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 border-0 bg-white dark:bg-gray-900 focus:outline-none placeholder-gray-400 text-gray-900 dark:text-white resize-none overflow-hidden min-h-[24px] max-h-32"
              rows={1}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                type="button"
                onClick={onAttachFile}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Emoji picker */}
          {isEmojiPickerOpen && (
            <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                  onClick={() => {
                    onMessageChange(message + emoji);
                    setIsEmojiPickerOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className={cn(
            'p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full',
            'hover:from-blue-700 hover:to-indigo-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all shadow-lg',
            'flex-shrink-0'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          // Handle file upload
          if (e.target.files?.[0]) {
            // Implement file upload logic here
            console.log('File selected:', e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
