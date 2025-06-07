// RecentUpdatesList.tsx - Replace entire file content
import React from 'react';
import RecentUpdateItem from './RecentUpdateItem';
import { motion } from 'framer-motion';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Users, Sparkles } from 'lucide-react';
import EmptyStatusPlaceholder from './EmptyStatusPlaceholder';

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
            <EmptyStatusPlaceholder onAddStatus={function (): void {
                    throw new Error('Function not implemented.');
                  } } />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecentUpdatesList;