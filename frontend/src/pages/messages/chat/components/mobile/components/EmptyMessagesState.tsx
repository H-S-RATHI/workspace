import React from 'react';
import { Search } from 'lucide-react';
interface EmptyStateProps {
  hasError?: boolean;
}
export const EmptyMessagesState: React.FC<EmptyStateProps> = ({ hasError = false }) => {
  if (hasError) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load conversations. Please try again later.
      </div>
    );
  }
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-blue-500" />
      </div>
      <p className="text-gray-600 font-medium">No conversations yet</p>
      <p className="text-sm text-gray-400 mt-1">Search for a user to start chatting</p>
    </div>
  );
};
