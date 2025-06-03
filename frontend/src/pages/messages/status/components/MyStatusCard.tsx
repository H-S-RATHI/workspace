import React from 'react';
import { Eye, Clock, Plus, Camera } from 'lucide-react';

interface MyStatusCardProps {
  myStatuses: any[];
  onView: () => void;
  onAdd: () => void;
}

const MyStatusCard: React.FC<MyStatusCardProps> = ({ myStatuses, onView, onAdd }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
    <h3 className="font-semibold text-gray-900 mb-4">My Status</h3>
    {myStatuses.length > 0 ? (
      <div className="space-y-3">
        <div 
          onClick={onView}
          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 rounded-full border-3 border-blue-500 p-0.5">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">You</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">My Status</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{myStatuses.reduce((sum, s) => sum + s.viewCount, 0)} views</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{myStatuses.length} updates</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add to your status</span>
        </button>
      </div>
    ) : (
      <button 
        onClick={onAdd}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
      >
        <div className="text-gray-600 group-hover:text-blue-600">
          <Camera className="w-8 h-8 mx-auto mb-3" />
          <p className="font-medium">Tap to add status update</p>
          <p className="text-sm text-gray-500 mt-1">Share a photo, video, or text</p>
        </div>
      </button>
    )}
  </div>
);

export default MyStatusCard; 