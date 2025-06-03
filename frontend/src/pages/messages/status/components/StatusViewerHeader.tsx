import React from 'react';
import { X, Eye, Clock } from 'lucide-react';

interface StatusViewerHeaderProps {
  statuses: any[];
  currentIndex: number;
  progress: number;
  onClose: () => void;
  currentStatus: any;
  getTimeRemaining: () => string;
}

const StatusViewerHeader: React.FC<StatusViewerHeaderProps> = ({ statuses, currentIndex, progress, onClose, currentStatus, getTimeRemaining }) => (
  <>
    {/* Progress bars */}
    <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
      {statuses.map((_: any, index: number) => (
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
  </>
);

export default StatusViewerHeader; 