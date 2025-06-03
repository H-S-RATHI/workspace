import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface StatusViewerActionsProps {
  onLike: () => void;
  onReply: () => void;
  showReply: boolean;
  setShowReply: (val: boolean) => void;
  createdAt: string;
}

const StatusViewerActions: React.FC<StatusViewerActionsProps> = ({ onLike, onReply, showReply, setShowReply, createdAt }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" onClick={onLike}>
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
      {format(new Date(createdAt), 'HH:mm')}
    </p>
  </div>
);

export default StatusViewerActions; 