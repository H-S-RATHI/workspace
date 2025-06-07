import React from 'react';
import { Eye, Clock, Plus, Camera, MessageCircle, MoreHorizontal, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../../lib/utils';

interface MyStatusCardProps {
  myStatuses: any[];
  onView: () => void;
  onAdd: () => void;
  user?: {
    name?: string;
    avatar?: string;
  };
}

const MyStatusCard: React.FC<MyStatusCardProps> = ({ myStatuses, onView, onAdd, user }) => {
  const hasStatus = myStatuses.length > 0;
  const totalViews = myStatuses.reduce((sum, s) => sum + (s.viewCount || 0), 0);
  const latestStatus = myStatuses[0];
  const userInitials = user?.name 
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'ME';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-1",
        "bg-gradient-to-br from-blue-50 to-purple-50",
        "border border-gray-100",
        "shadow-sm hover:shadow-md transition-shadow duration-300"
      )}>
        <div className="relative z-10 p-5 bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <AnimatePresence>
                  {hasStatus && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Status</h3>
                <p className="text-sm text-gray-500">
                  {hasStatus ? 'Tap to view updates' : 'Share a moment with friends'}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {hasStatus && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{totalViews}</span>
                  </span>
                  <span className="h-4 w-px bg-gray-200" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{myStatuses.length}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {hasStatus ? (
              <motion.div
                key="status-preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={onView}
                className="relative group/card"
              >
                <div className={cn(
                  "relative overflow-hidden rounded-xl border border-gray-100",
                  "transition-all duration-300 hover:border-blue-100 hover:shadow-sm"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                  {latestStatus.mediaUrl && latestStatus.mediaType === 'IMAGE' ? (
                    <img
                      src={latestStatus.mediaUrl}
                      alt="Status preview"
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Latest Update</p>
                        <p className="text-xs text-white/90">
                          {formatDistanceToNow(new Date(latestStatus.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd();
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {latestStatus.contentText && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-2 px-1">
                    {latestStatus.contentText}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center shadow-inner">
                  <Camera className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Share Your Day</h4>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                  Create a status that disappears in 24 hours
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={onAdd}
            className={cn(
              "w-full mt-4 rounded-xl py-3 font-medium transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "text-white shadow-sm hover:shadow-md",
              hasStatus ? "text-sm" : "text-base py-4"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            {hasStatus ? 'Add to your status' : 'Create Your First Status'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(MyStatusCard);