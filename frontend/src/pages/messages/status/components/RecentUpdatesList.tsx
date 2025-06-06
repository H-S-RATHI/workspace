// RecentUpdatesList.tsx - Replace entire file content
import React from 'react';
import RecentUpdateItem from './RecentUpdateItem';
import { motion } from 'framer-motion';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Users, Sparkles } from 'lucide-react';

interface RecentUpdatesListProps {
  groupedStatuses: any[];
  onView: (group: any) => void;
  isLoading: boolean;
}

const RecentUpdatesList: React.FC<RecentUpdatesListProps> = ({ groupedStatuses, onView, isLoading }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Recent Updates</h3>
              <p className="text-sm text-gray-500">See what your friends are up to</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/60 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>{groupedStatuses.length} friends</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/40 rounded-2xl">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : groupedStatuses.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {groupedStatuses.map((group: any) => (
                <motion.div key={group.user.userId} variants={item}>
                  <RecentUpdateItem 
                    group={group} 
                    onView={() => onView(group.statuses)} 
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Updates Yet</h4>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                When your friends share their moments, you'll see them here. Start by creating your own status!
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecentUpdatesList;