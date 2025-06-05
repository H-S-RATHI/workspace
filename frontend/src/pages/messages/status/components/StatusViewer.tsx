import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusViewerHeader from './StatusViewerHeader';
import StatusViewerContent from './StatusViewerContent';
import StatusViewerActions from './StatusViewerActions';
import StatusViewerReplyInput from './StatusViewerReplyInput';

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

  // Handle marking status as viewed
  useEffect(() => {
    if (currentStatus && !currentStatus.hasViewed) {
      onViewStatus(currentStatus.statusId);
    }
  }, [currentStatus, onViewStatus]);

  // Handle progress bar animation
  useEffect(() => {
    if (!currentStatus || isPaused) return;

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
  }, [currentIndex, currentStatus, isPaused, onNext, onClose, statuses.length]);

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
      <StatusViewerHeader
        statuses={statuses}
        currentIndex={currentIndex}
        progress={progress}
        onClose={onClose}
        currentStatus={currentStatus}
        getTimeRemaining={getTimeRemaining}
      />

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
      <StatusViewerContent currentStatus={currentStatus} />

      {/* Bottom actions */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <StatusViewerActions
          onLike={() => {}}
          onReply={handleReply}
          showReply={showReply}
          setShowReply={setShowReply}
          createdAt={currentStatus.createdAt}
        />
        <StatusViewerReplyInput
          replyText={replyText}
          setReplyText={setReplyText}
          handleReply={handleReply}
          showReply={showReply}
        />
      </div>
    </motion.div>
  );
};

export default StatusViewer;