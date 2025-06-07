import React from 'react';
import { MessageCircle, Image as ImageIcon, Video as VideoIcon, FileText as TextIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../../lib/utils';

interface RecentUpdateItemProps {
  group: any;
  onView: () => void;
  isLast?: boolean;
}

const getStatusIcon = (mediaType: string) => {
  const iconClass = "w-3.5 h-3.5";
  switch (mediaType) {
    case 'IMAGE':
      return <ImageIcon className={cn(iconClass, "text-blue-500")} />;
    case 'VIDEO':
      return <VideoIcon className={cn(iconClass, "text-purple-500")} />;
    case 'TEXT':
      return <TextIcon className={cn(iconClass, "text-amber-500")} />;
    default:
      return <MessageCircle className={cn(iconClass, "text-gray-400")} />;
  }
};

const RecentUpdateItem: React.FC<RecentUpdateItemProps> = ({ group, onView, isLast = false }) => {
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
    : 'US';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        backgroundColor: 'rgba(249, 250, 251, 0.7)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onView}
      className={cn(
        "relative px-5 py-3.5 cursor-pointer transition-all duration-200",
        !isLast && "border-b border-gray-100",
        hasUnviewed ? "bg-blue-50/50" : "bg-white"
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* User avatar with gradient and status ring */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm relative overflow-hidden",
            hasUnviewed 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
              : "bg-gradient-to-br from-gray-300 to-gray-400"
          )}>
            <span className="relative z-10">{userInitials}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-30" />
          </div>
          
          {hasUnviewed && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[10px] text-white font-bold">{statusCount}</span>
            </motion.div>
          )}
        </div>

        {/* Status content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate text-sm">
                {group.user.fullName || 'User'}
              </h4>
              {!hasUnviewed && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {latestStatus && formatDistanceToNow(new Date(latestStatus.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Status preview row */}
          <div className="mt-1.5 flex items-center gap-2 overflow-hidden">
            {latestStatus?.mediaType && latestStatus.mediaType !== 'TEXT' && (
              <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                <img 
                  src={latestStatus.mediaType === 'VIDEO' ? (latestStatus.thumbnailUrl || latestStatus.mediaUrl) : latestStatus.mediaUrl} 
                  alt="Status preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {latestStatus?.contentText ? (
                <p className="text-sm text-gray-700 line-clamp-1 pr-2">
                  {latestStatus.contentText}
                </p>
              ) : (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="truncate">
                    {statusCount} {statusCount === 1 ? 'update' : 'updates'}
                  </span>
                  {latestStatus?.mediaType && (
                    <>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <div className="flex items-center text-gray-500">
                        {getStatusIcon(latestStatus.mediaType)}
                        <span className="ml-1 capitalize">
                          {latestStatus.mediaType.toLowerCase()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator for unread status */}
      {hasUnviewed && (
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 origin-left"
        />
      )}
    </motion.div>
  );
};

export default React.memo(RecentUpdateItem);