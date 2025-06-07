import React, { useState, useRef } from 'react';
import { X, Image, Video, MapPin, Hash, Smile } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploading?: boolean;
  uploaded?: boolean;
  cloudinaryUrl?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
        uploading: false,
        uploaded: false,
      }));
      setMediaFiles(prev => [...prev, ...newFiles]);
    },
  });

  const uploadMediaToCloudinary = async (mediaFile: MediaFile): Promise<string> => {
    const formData = new FormData();
    formData.append(mediaFile.type, mediaFile.file);
    formData.append('folder', 'posts');

    try {
      setMediaFiles(prev => prev.map(f => 
        f === mediaFile ? { ...f, uploading: true } : f
      ));

      const endpoint = mediaFile.type === 'image' 
        ? '/api/v1/media/upload/image'
        : '/api/v1/media/upload/video';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response.data[mediaFile.type].url;
      
      setMediaFiles(prev => prev.map(f => 
        f === mediaFile 
          ? { ...f, uploading: false, uploaded: true, cloudinaryUrl: uploadedUrl }
          : f
      ));

      return uploadedUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setMediaFiles(prev => prev.map(f => 
        f === mediaFile ? { ...f, uploading: false } : f
      ));
      throw error;
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags(prev => [...prev, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload all media files first
      const mediaUrls: string[] = [];
      for (const mediaFile of mediaFiles) {
        if (!mediaFile.uploaded) {
          const url = await uploadMediaToCloudinary(mediaFile);
          mediaUrls.push(url);
        } else if (mediaFile.cloudinaryUrl) {
          mediaUrls.push(mediaFile.cloudinaryUrl);
        }
      }

      // Determine post type
      let postType = 'TEXT';
      if (mediaFiles.length > 1) {
        postType = 'CAROUSEL';
      } else if (mediaFiles.length === 1) {
        postType = mediaFiles[0].type === 'image' ? 'PHOTO' : 'VIDEO';
      }

      // Create post
      const postData = {
        postType,
        caption: caption.trim(),
        mediaUrls,
        hashtags,
        location: location.trim() || undefined,
      };

      const response = await api.post('/api/v1/discover/posts', postData);
      
      toast.success('Post created successfully!');
      onPostCreated?.(response.data.post);
      handleClose();
    } catch (error: any) {
      console.error('Create post error:', error);
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    mediaFiles.forEach(file => URL.revokeObjectURL(file.preview));
    
    // Reset form
    setCaption('');
    setLocation('');
    setHashtags([]);
    setMediaFiles([]);
    setCurrentHashtag('');
    setIsSubmitting(false);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Caption */}
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {caption.length}/2000
            </div>
          </div>

          {/* Media Upload */}
          <div className="mb-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="flex space-x-2 mb-2">
                  <Image className="w-8 h-8 text-gray-400" />
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop photos/videos, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Up to 10 files, max 50MB each
                </p>
              </div>
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {mediaFiles.map((mediaFile, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {mediaFile.type === 'image' ? (
                        <img
                          src={mediaFile.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={mediaFile.preview}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      
                      {/* Upload status overlay */}
                      {mediaFile.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      
                      {mediaFile.uploaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeMediaFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={currentHashtag}
                onChange={(e) => setCurrentHashtag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add hashtag"
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addHashtag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeHashtag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Smile className="w-4 h-4" />
            <span>Add emoji, mentions, and more</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!caption.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;