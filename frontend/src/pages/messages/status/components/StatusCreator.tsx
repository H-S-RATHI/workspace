import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  Type, 
  Users, 
  Globe, 
  UserCheck, 
  Lock,
  Send
} from 'lucide-react';
import { statusService } from '../../../../services/statusService';

interface StatusCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStatus: (statusData: any) => void;
}

const backgroundColors = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
  '#6366f1', '#f97316', '#14b8a6', '#a855f7'
];

const textColors = ['#ffffff', '#000000', '#374151', '#f3f4f6'];

const StatusCreator: React.FC<StatusCreatorProps> = ({
  isOpen,
  onClose,
  onCreateStatus,
}) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
  const [backgroundColor, setBackgroundColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM'>('CONTACTS');
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (file.type.startsWith('image/')) {
        setMediaType('IMAGE');
      } else if (file.type.startsWith('video/')) {
        setMediaType('VIDEO');
      }
    }
  };

  const handleMentionInput = (text: string) => {
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setShowMentions(true);
    } else if (lastAtIndex !== -1) {
      const query = text.slice(lastAtIndex + 1);
      if (query.includes(' ')) {
        setShowMentions(false);
      } else {
        // TODO: Handle user mention query
        setShowMentions(true);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;

    setIsLoading(true);
    try {
      let mediaUrl = null;
      
      // TODO: Upload media file if present
      if (mediaFile) {
        // Implement file upload logic here
        console.log('Uploading file:', mediaFile);
      }

      // Prepare status data according to backend expectations
      const statusData: any = {
        content: content.trim() || undefined,
        mediaType,
        privacy,
        ...(mediaUrl && { mediaUrl }),
        ...(backgroundColor && { backgroundColor }),
        ...(textColor && { textColor }),
        ...(mentionedUsers?.length > 0 && { mentionedUsers })
      };
      
      // Remove undefined values
      Object.keys(statusData).forEach(key => 
        statusData[key] === undefined && delete statusData[key]
      );

      // Use the statusService to create the status
      await statusService.createStatus(statusData);
      
      // Call the parent's callback if provided
      if (onCreateStatus) {
        await onCreateStatus(statusData);
      }
      
      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType('TEXT');
      setMentionedUsers([]);
      onClose();
    } catch (error: any) {
      console.error('Failed to create status:', error);
      // Show error message from the server if available
      const errorMessage = error.response?.data?.message || 'Failed to create status. Please try again.';
      alert(errorMessage);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create Status</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden">
                {mediaType === 'IMAGE' ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-48 object-cover" controls />
                )}
                <button
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setMediaType('TEXT');
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Text Content */}
            {!mediaPreview && (
              <div 
                className="relative rounded-lg p-6 min-h-[200px] flex items-center justify-center"
                style={{ backgroundColor }}
              >
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleMentionInput(e.target.value);
                  }}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent border-none outline-none resize-none text-center text-xl font-medium placeholder-opacity-70"
                  style={{ color: textColor }}
                  rows={4}
                />
              </div>
            )}

            {/* Text input for media posts */}
            {mediaPreview && (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleMentionInput(e.target.value);
                }}
                placeholder="Add a caption..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            )}

            {/* Mention suggestions */}
            {showMentions && (
              <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-2">Mention someone:</p>
                {/* TODO: Implement user search and mention functionality */}
                <div className="text-sm text-gray-500">Start typing to search users...</div>
              </div>
            )}

            {/* Controls */}
            <div className="space-y-4">
              {/* Media and Text Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Media</span>
                </button>
                
                <button
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setMediaType('TEXT');
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    mediaType === 'TEXT' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="text-sm">Text</span>
                </button>
              </div>

              {/* Color Controls for Text Posts */}
              {!mediaPreview && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Background Color</p>
                    <div className="flex flex-wrap gap-2">
                      {backgroundColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            backgroundColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Text Color</p>
                    <div className="flex gap-2">
                      {textColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            textColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Who can see this?</p>
                <div className="space-y-2">
                  {[
                    { value: 'PUBLIC', label: 'Everyone', icon: Globe },
                    { value: 'CONTACTS', label: 'Contacts & Chats', icon: UserCheck },
                    { value: 'CLOSE_FRIENDS', label: 'Close Friends', icon: Users },
                    { value: 'CUSTOM', label: 'Custom', icon: Lock },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setPrivacy(value as any)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        privacy === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaFile) || isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? 'Sharing...' : 'Share Status'}</span>
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusCreator;