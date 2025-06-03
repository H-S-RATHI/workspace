import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface StatusViewerReplyInputProps {
  replyText: string;
  setReplyText: (val: string) => void;
  handleReply: () => void;
  showReply: boolean;
}

const StatusViewerReplyInput: React.FC<StatusViewerReplyInputProps> = ({ replyText, setReplyText, handleReply, showReply }) => (
  <AnimatePresence>
    {showReply && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mt-4 flex items-center space-x-2"
      >
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to story..."
          className="flex-1 px-4 py-2 bg-white/20 text-white placeholder-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
          onKeyPress={(e) => e.key === 'Enter' && handleReply()}
        />
        <button
          onClick={handleReply}
          disabled={!replyText.trim()}
          className="p-2 bg-white text-black rounded-full hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default StatusViewerReplyInput; 