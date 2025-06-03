import React from 'react';
import { Camera } from 'lucide-react';

const EmptyStatusPlaceholder: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Camera className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No status updates yet</h3>
    <p className="text-gray-500 max-w-md mx-auto">
      When your contacts share status updates, they'll appear here. Be the first to share yours!
    </p>
  </div>
);

export default EmptyStatusPlaceholder; 