import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Send, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Status {
  statusId: string;
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl: string;
  content?: string;
  mediaUrl?: string;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
  backgroundColor: string;
  textColor: string;
  privacy: string;
  viewCount: number;
  hasViewed: boolean;
  mentionedUsers: string[];
  createdAt: string;
  expiresAt: string;
}

interface StatusViewerProps {
  statuses: Status[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onViewStatus: (statusId: string) => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onViewStatus,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const currentStatus = statuses[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (!currentStatus || isPaused) return;

    // Mark as viewed
    if (!currentStatus.hasViewed) {
      onViewStatus(currentStatus.statusId);
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (STORY_DURATION / 100));
        if (newProgress >= 100) {
          if (currentIndex < statuses.length - 1) {
            onNext();
          } else {
            onClose();
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, currentStatus, isPaused, onNext, onClose, onViewStatus]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handleReply = () => {
    if (replyText.trim()) {
      // TODO: Implement reply functionality
      console.log('Reply:', replyText);
      setReplyText('');
      setShowReply(false);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(currentStatus.expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!currentStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {statuses.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={currentStatus.profilePhotoUrl || `https://ui-avatars.com/api/?name=${currentStatus.fullName}&background=3b82f6&color=fff`}
            alt={currentStatus.fullName}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-white font-semibold text-sm">{currentStatus.fullName}</p>
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Clock className="w-3 h-3" />
              <span>{getTimeRemaining()}</span>
              <Eye className="w-3 h-3 ml-2" />
              <span>{currentStatus.viewCount}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation areas */}
      <div className="absolute inset-0 flex">
        <div 
          className="flex-1 cursor-pointer"
          onClick={onPrevious}
        />
        <div 
          className="flex-1 cursor-pointer"
          onClick={onNext}
        />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentStatus.mediaType === 'IMAGE' && currentStatus.mediaUrl ? (
          <img
            src={currentStatus.mediaUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        ) : currentStatus.mediaType === 'VIDEO' && currentStatus.mediaUrl ? (
          <video
            src={currentStatus.mediaUrl}
            autoPlay
            muted
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: currentStatus.backgroundColor }}
          >
            <p
              className="text-center text-2xl font-medium max-w-md leading-relaxed"
              style={{ color: currentStatus.textColor }}
            >
              {currentStatus.content}
            </p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowReply(!showReply)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-white/60 text-xs">
            {format(new Date(currentStatus.createdAt), 'HH:mm')}
          </p>
        </div>

        {/* Reply input */}
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
      </div>
    </motion.div>
  );
};

export default StatusViewer;