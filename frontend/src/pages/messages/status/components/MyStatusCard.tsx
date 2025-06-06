// MyStatusCard.tsx - Replace entire file content
import React from 'react';
import { Eye, Clock, Plus, Camera, MessageCircle, MoreHorizontal, Sparkles } from 'lucide-react';
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden"
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl"></div>
      
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20 rounded-3xl p-px">
        <div className="w-full h-full bg-white/80 backdrop-blur-xl rounded-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">My Status</h3>
              <p className="text-sm text-gray-500">Express yourself</p>
            </div>
          </div>
          {hasStatus && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-blue-600">
                <Eye className="w-4 h-4 mr-1" />
                <span className="font-semibold">{totalViews}</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-semibold">{myStatuses.length}</span>
              </div>
            </div>
          )}
        </div>
        
        {hasStatus ? (
          <div className="space-y-4">
            <motion.div 
              onClick={onView}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 cursor-pointer hover:bg-white/80 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-lg">
                    {latestStatus.mediaType === 'IMAGE' && latestStatus.mediaUrl ? (
                      <img 
                        src={latestStatus.mediaUrl} 
                        alt="Status preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MessageCircle className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Latest Update</h4>
                    <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                      {latestStatus && formatDistanceToNow(new Date(latestStatus.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {latestStatus.contentText && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2 font-medium">
                      {latestStatus.contentText}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-white/60 rounded-xl">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
            
            <Button 
              onClick={onAdd}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to your status
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg"
            >
              <Camera className="w-10 h-10 text-blue-600" />
            </motion.div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Share Your Moment</h4>
            <p className="text-gray-600 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Create beautiful stories that disappear after 24 hours and connect with your friends
            </p>
            <Button 
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl px-8 py-4 font-semibold"
            >
              <Camera className="w-5 h-5 mr-2" />
              Create Your First Status
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyStatusCard;