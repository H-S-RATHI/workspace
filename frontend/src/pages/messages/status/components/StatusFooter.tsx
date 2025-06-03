import React from 'react';
import { Send } from 'lucide-react';

interface StatusFooterProps {
  handleSubmit: () => void;
  disabled: boolean;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StatusFooter: React.FC<StatusFooterProps> = ({ handleSubmit, disabled, isLoading, fileInputRef, handleFileSelect }) => (
  <div className="p-4 border-t border-gray-200">
    <button
      onClick={handleSubmit}
      disabled={disabled}
      className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <Send className="w-5 h-5" />
      <span>{isLoading ? 'Sharing...' : 'Share Status'}</span>
    </button>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,video/*"
      onChange={handleFileSelect}
      className="hidden"
    />
  </div>
);

export default StatusFooter; 