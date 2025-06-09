import React from 'react';
import { DateHeaderProps } from '../types';
import { formatDateForHeader } from '../utils/dateUtils';
export const DateHeader: React.FC<DateHeaderProps> = ({ date }) => {
  const displayDate = formatDateForHeader(date);
  
  if (!displayDate) {
    return null;
  }
  
  return (
    <div className="flex items-center my-4">
      <div className="flex-1 border-t border-gray-200"></div>
      <span className="px-3 text-xs text-gray-500 font-medium">
        {displayDate}
      </span>
      <div className="flex-1 border-t border-gray-200"></div>
    </div>
  );
};
