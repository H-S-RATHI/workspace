import React from 'react';
import { Eye, Clock, Plus, Camera, MessageCircle, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface MyStatusCardProps {
  myStatuses: any[];
  onView: () => void;
  onAdd: () => void;
}

const MyStatusCard: React.FC<MyStatusCardProps> = ({ myStatuses, onView, onAdd }) => {
  const hasStatus = myStatuses.length > 0;
  const totalViews = myStatuses.reduce((sum, s) => sum + (s.viewCount || 0), 0);
  const latestStatus = myStatuses[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-lg">My Status</h3>
      </div>
      
      {hasStatus ? (
        <>
          <div 
            onClick={onView}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                  {latestStatus.mediaType === 'IMAGE' && latestStatus.mediaUrl ? (
                    <img 
                      src={latestStatus.mediaUrl} 
                      alt="Status preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">My Status</h4>
                  <span className="text-xs text-gray-400">
                    {latestStatus && formatDistanceToNow(new Date(latestStatus.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{totalViews} {totalViews === 1 ? 'view' : 'views'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{myStatuses.length} {myStatuses.length === 1 ? 'update' : 'updates'}</span>
                  </div>
                </div>
                {latestStatus.contentText && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {latestStatus.contentText}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <Button 
              onClick={onAdd}
              variant="outline"
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to your status
            </Button>
          </div>
        </>
      ) : (
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <Camera className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-1">Share a moment</h4>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Share photos, videos, or text updates that disappear after 24 hours
          </p>
          <Button 
            onClick={onAdd}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Camera className="w-4 h-4 mr-2" />
            Create status
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyStatusCard;