import React from 'react';

interface RecentUpdateItemProps {
  group: any;
  onView: () => void;
}

const RecentUpdateItem: React.FC<RecentUpdateItemProps> = ({ group, onView }) => (
  <div 
    onClick={onView}
    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
  >
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-3 ${
      group.hasUnviewed ? 'border-green-500' : 'border-gray-300'
    } p-0.5`}>
      <img
        src={group.user.profilePhotoUrl || `https://ui-avatars.com/api/?name=${group.user.fullName}&background=3b82f6&color=fff`}
        alt={group.user.fullName}
        className="w-full h-full rounded-full object-cover"
      />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{group.user.fullName}</h4>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>{group.statuses.length} update{group.statuses.length > 1 ? 's' : ''}</span>
        <span>•</span>
        <span>{new Date(group.statuses[0].createdAt).toLocaleDateString()}</span>
      </div>
    </div>
    {group.hasUnviewed && (
      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
    )}
  </div>
);

export default RecentUpdateItem; 