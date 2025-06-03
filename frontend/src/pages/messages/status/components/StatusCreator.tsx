import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  Type
} from 'lucide-react';
import StatusMediaPreview from './StatusMediaPreview';
import StatusTextInput from './StatusTextInput';
import StatusMentionSuggestions from './StatusMentionSuggestions';
import StatusPrivacySelector from './StatusPrivacySelector';
import StatusFooter from './StatusFooter';

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
      let mediaUrl: string | null = null;
      
      // TODO: Upload media file if present
      if (mediaFile) {
        // Implement file upload logic here
        console.log('Uploading file:', mediaFile);
        // For now, we'll use a placeholder URL
        mediaUrl = URL.createObjectURL(mediaFile);
      }

      // Prepare status data according to backend expectations
      const statusData: {
        content?: string;
        mediaUrl?: string | null;
        mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
        privacy: 'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM';
        backgroundColor?: string;
        textColor?: string;
        mentionedUsers?: string[];
      } = {
        mediaType,
        privacy,
      };

      // Only add content if it exists
      const trimmedContent = content.trim();
      if (trimmedContent) {
        statusData.content = trimmedContent;
      }

      // Add media URL if exists
      if (mediaUrl) {
        statusData.mediaUrl = mediaUrl;
      }

      // Add optional fields if they exist
      if (backgroundColor) {
        statusData.backgroundColor = backgroundColor;
      }
      if (textColor) {
        statusData.textColor = textColor;
      }
      if (mentionedUsers?.length > 0) {
        statusData.mentionedUsers = mentionedUsers;
      }

      // Call the parent's callback to handle status creation
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
            {mediaPreview && (mediaType === 'IMAGE' || mediaType === 'VIDEO') && (
              <StatusMediaPreview
                mediaPreview={mediaPreview}
                mediaType={mediaType}
                onRemove={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                  setMediaType('TEXT');
                }}
              />
            )}

            {/* Text Content */}
            {!mediaPreview && (
              <StatusTextInput
                content={content}
                setContent={setContent}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                textColor={textColor}
                setTextColor={setTextColor}
                backgroundColors={backgroundColors}
                textColors={textColors}
                textareaRef={textareaRef}
                handleMentionInput={handleMentionInput}
                showColorPickers={!mediaPreview}
              />
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
            <StatusMentionSuggestions showMentions={showMentions} />

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

              {/* Privacy Settings */}
              <StatusPrivacySelector privacy={privacy} setPrivacy={setPrivacy} />
            </div>
          </div>

          {/* Footer */}
          <StatusFooter
            handleSubmit={handleSubmit}
            disabled={(!content.trim() && !mediaFile) || isLoading}
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
          />

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