import React from 'react';
import { Clock, MessageCircle, Image as ImageIcon, Video as VideoIcon, FileText as TextIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface RecentUpdateItemProps {
  group: any;
  onView: () => void;
}

const getStatusIcon = (mediaType: string) => {
  switch (mediaType) {
    case 'IMAGE':
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    case 'VIDEO':
      return <VideoIcon className="w-4 h-4 text-purple-500" />;
    case 'TEXT':
      return <TextIcon className="w-4 h-4 text-amber-500" />;
    default:
      return <MessageCircle className="w-4 h-4 text-gray-400" />;
  }
};

const RecentUpdateItem: React.FC<RecentUpdateItemProps> = ({ group, onView }) => {
  const latestStatus = group.statuses[0];
  const hasUnviewed = group.statuses.some((s: any) => !s.viewed);
  const statusCount = group.statuses.length;
  const userInitials = group?.user?.fullName
    ? group.user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'US'; // Default initials if user or fullName is not available

  return (
    <motion.div 
      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      onClick={onView}
      className="relative px-4 py-3 cursor-pointer transition-colors"
    >
      <div className="flex items-start space-x-3">
        {/* User avatar with status indicator */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
            {userInitials}
          </div>
          {hasUnviewed && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{statusCount}</span>
            </div>
          )}
        </div>

        {/* Status content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 truncate">{group.user.fullName || 'User'}</h4>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {latestStatus && formatDistanceToNow(new Date(latestStatus.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center mt-0.5 space-x-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">
                {statusCount} {statusCount === 1 ? 'update' : 'updates'}
              </span>
            </div>
            
            {latestStatus && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="mx-1">•</span>
                <div className="flex items-center">
                  {getStatusIcon(latestStatus.mediaType)}
                  <span className="ml-1 truncate">
                    {latestStatus.mediaType === 'TEXT' 
                      ? latestStatus.contentText?.substring(0, 20) + (latestStatus.contentText?.length > 20 ? '...' : '')
                      : latestStatus.mediaType?.toLowerCase()
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {latestStatus?.contentText && (
            <p className="text-sm text-gray-600 mt-1.5 line-clamp-1">
              {latestStatus.contentText}
            </p>
          )}
        </div>

        {/* Preview thumbnail */}
        {latestStatus?.mediaUrl && latestStatus.mediaType !== 'TEXT' && (
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            <img 
              src={latestStatus.mediaType === 'VIDEO' ? latestStatus.thumbnailUrl : latestStatus.mediaUrl} 
              alt="Status preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentUpdateItem; 