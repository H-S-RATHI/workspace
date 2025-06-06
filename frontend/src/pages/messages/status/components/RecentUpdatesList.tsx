import React from 'react';
import RecentUpdateItem from './RecentUpdateItem';
import { motion } from 'framer-motion';
import { Skeleton } from '../../../../components/ui/Skeleton';

interface RecentUpdatesListProps {
  groupedStatuses: any[];
  onView: (group: any) => void;
  isLoading: boolean;
}

const RecentUpdatesList: React.FC<RecentUpdatesListProps> = ({ groupedStatuses, onView, isLoading }) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-lg">Recent Updates</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : groupedStatuses.length > 0 ? (
          // Actual content
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-gray-100"
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
          // Empty state
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">No updates yet</h4>
            <p className="text-gray-500 text-sm">
              When your contacts share updates, they'll appear here
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentUpdatesList;