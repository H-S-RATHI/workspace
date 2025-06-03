import React from 'react';
import RecentUpdateItem from './RecentUpdateItem';

interface RecentUpdatesListProps {
  groupedStatuses: any[];
  onView: (group: any) => void;
  isLoading: boolean;
}

const RecentUpdatesList: React.FC<RecentUpdatesListProps> = ({ groupedStatuses, onView, isLoading }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
    <h3 className="font-semibold text-gray-900 mb-4">Recent Updates</h3>
    {isLoading ? (
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {groupedStatuses.map((group: any) => (
          <RecentUpdateItem key={group.user.userId} group={group} onView={() => onView(group.statuses)} />
        ))}
      </div>
    )}
  </div>
);

export default RecentUpdatesList; 