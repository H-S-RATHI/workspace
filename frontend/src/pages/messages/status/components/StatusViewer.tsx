import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Heart, 
  Share2, 
  MoreVertical, 
  Flag,
  Bookmark,
  Pause,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

// No need for global declaration with modern TypeScript

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
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  isSaved: boolean;
  hasViewed: boolean;
  mentionedUsers: string[];
  createdAt: string;
  expiresAt: string;
}

interface StatusViewerProps {
  statuses: Status[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onViewStatus: (statusId: string) => Promise<boolean>;
  onLike: (statusId: string) => void;
  onReply: (statusId: string, text: string) => void;
  onShare: (statusId: string) => void;
  onSave: (statusId: string) => void;
  onReport: (statusId: string) => void;
  currentUserId: string;
}

const StatusViewer: React.FC<StatusViewerProps> = ({
  statuses,
  currentIndex,
  onClose,
  onPrevious,
  onViewStatus,
  onLike,
  onReply,
  onShare,
  onSave,
  onReport,
  currentUserId,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(currentIndex);
  
  const status = statuses[currentStatusIndex];
  const progressInterval = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  const STORY_DURATION = 5000; // 5 seconds per status
  
  if (!status) return null;
  
  const isOwnStatus = status.userId === currentUserId;
  const isFirstStatus = currentStatusIndex === 0;
  const isLastStatus = currentStatusIndex === statuses.length - 1;

  // Handle progress bar animation
  useEffect(() => {
    if (isPaused) return;
    
    const duration = STORY_DURATION; // 5 seconds per status
    const startTime = Date.now();
    
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    progressInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressInterval.current);
        if (isLastStatus) {
          onClose();
        } else {
          handleNext();
        }
      }
    }, 50);
    
    return () => {
      if (progressInterval.current !== undefined) {
        clearInterval(progressInterval.current);
        progressInterval.current = undefined;
      }
    };
  }, [isPaused, currentStatusIndex, isLastStatus, onClose, STORY_DURATION]);

  // Reset progress when status changes
  useEffect(() => {
    setProgress(0);
    const markStatusAsViewed = async () => {
      if (status && !status.hasViewed) {
        try {
          await onViewStatus(status.statusId);
          // Optionally update the local state to reflect the view
          // This assumes your status object has a hasViewed property
          // If not, you might need to update the parent component's state
        } catch (error) {
          console.error('Failed to mark status as viewed:', error);
          // You might want to show a toast or retry logic here
        }
      }
    };
    
    markStatusAsViewed();
  }, [currentStatusIndex, status, onViewStatus]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStatusIndex, isPaused]);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle reply submission
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && status) {
      try {
        await onReply(status.statusId, replyText);
        setReplyText('');
        setShowReplyInput(false);
      } catch (error) {
        console.error('Failed to submit reply:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleNext = () => {
    if (isLastStatus) {
      onClose();
    } else {
      setCurrentStatusIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (isFirstStatus) {
      onPrevious();
    } else {
      setCurrentStatusIndex(prev => prev - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(status.expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const handleLike = () => {
    onLike(status.statusId);
  };
  
  const handleShare = () => {
    onShare(status.statusId);
  };
  
  const handleSave = () => {
    onSave(status.statusId);
  };
  
  const handleReport = () => {
    onReport(status.statusId);
    setShowOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Progress bar */}
      <div className="h-1 bg-gray-700 w-full">
        <motion.div
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={status.profilePhotoUrl}
            alt={status.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-white font-medium">{status.fullName}</p>
            <p className="text-gray-400 text-sm">{getTimeRemaining()} left</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={togglePause} className="text-white">
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {status.mediaType === 'IMAGE' && status.mediaUrl && (
          <img
            src={status.mediaUrl}
            alt="Status content"
            className="max-h-[80vh] max-w-full object-contain"
          />
        )}
        {status.mediaType === 'VIDEO' && status.mediaUrl && (
          <video
            src={status.mediaUrl}
            className="max-h-[80vh] max-w-full"
            autoPlay
            loop
            muted
          />
        )}
        {status.mediaType === 'TEXT' && (
          <div 
            className="p-8 rounded-lg text-center max-w-md mx-auto"
            style={{
              backgroundColor: status.backgroundColor,
              color: status.textColor
            }}
          >
            <p className="text-2xl">{status.content}</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full ${status.isLiked ? 'text-red-500' : 'text-white'}`}
          >
            <Heart fill={status.isLiked ? 'currentColor' : 'none'} size={24} />
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-white p-2"
          >
            <MessageCircle size={24} />
          </button>
          <button onClick={handleShare} className="text-white p-2">
            <Share2 size={24} />
          </button>
        </div>

        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-white p-2"
          >
            <MoreVertical size={24} />
          </button>
          
          {showOptions && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
              <button
                onClick={handleSave}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Bookmark size={16} />
                <span>{status.isSaved ? 'Unsave' : 'Save'}</span>
              </button>
              {!isOwnStatus && (
                <button
                  onClick={handleReport}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Flag size={16} />
                  <span>Report</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply input */}
      {showReplyInput && (
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleReplySubmit} className="flex space-x-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default StatusViewer;