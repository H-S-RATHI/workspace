import React from 'react';
import { Camera, Plus, Users } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { motion } from 'framer-motion';

interface EmptyStatusPlaceholderProps {
  onAddStatus: () => void;
}

const EmptyStatusPlaceholder: React.FC<EmptyStatusPlaceholderProps> = ({ onAddStatus }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center overflow-hidden"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-60 rounded-full filter blur-3xl -z-10" />
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Users className="w-8 h-8 text-blue-600" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">No updates yet</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      When your contacts share status updates, they'll appear here. Be the first to share yours!
    </p>
    <Button 
      onClick={onAddStatus}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
    >
      <Plus className="w-4 h-4 mr-2" />
      Share an update
    </Button>
    <div className="mt-8 pt-6 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-3">STATUS UPDATES DISAPPEAR AFTER 24 HOURS</p>
      <div className="flex items-center justify-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={onAddStatus}
        >
          <Camera className="w-4 h-4 mr-1.5" />
          <span>Photo</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={onAddStatus}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span>Video</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={onAddStatus}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Text</span>
        </Button>
      </div>
    </div>
  </motion.div>
);

export default EmptyStatusPlaceholder;