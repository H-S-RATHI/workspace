import React from 'react';
interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
}
export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onSendMessage,
  isSending
}) => {
  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <form onSubmit={onSendMessage} className="flex items-center space-x-3">
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
  );
};