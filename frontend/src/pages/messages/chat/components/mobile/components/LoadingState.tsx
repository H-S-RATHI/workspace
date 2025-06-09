import React from 'react';
export const LoadingState: React.FC = () => {
  return (
    <div className="mt-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-gray-100 animate-pulse">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="ml-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};