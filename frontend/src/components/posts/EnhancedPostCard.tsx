import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Post {
  postId: string;
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl?: string;
  postType: 'TEXT' | 'PHOTO' | 'VIDEO' | 'CAROUSEL';
  caption?: string;
  mediaUrls: string[];
  hashtags: string[];
  location?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  createdAt: string;
}

interface EnhancedPostCardProps {
  post: Post;
  onLike?: (postId: string, isLiked: boolean) => void;
  onSave?: (postId: string, isSaved: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({
  post,
  onLike,
  onSave,
  onComment,
  onShare,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'now';
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/api/v1/discover/posts/${post.postId}/like`);
      const newIsLiked = response.data.isLiked;
      
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      onLike?.(post.postId, newIsLiked);
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.post(`/api/v1/discover/posts/${post.postId}/save`);
      const newIsSaved = response.data.isSaved;
      
      setIsSaved(newIsSaved);
      onSave?.(post.postId, newIsSaved);
      toast.success(newIsSaved ? 'Post saved' : 'Post unsaved');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save post');
    }
  };

  const handleShare = async (shareType: 'DIRECT' | 'STORY' | 'EXTERNAL', platform?: string) => {
    try {
      await api.post(`/api/v1/discover/posts/${post.postId}/share`, {
        shareType,
        platform,
      });
      
      onShare?.(post.postId);
      setShowShareMenu(false);
      toast.success('Post shared successfully');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share post');
    }
  };

  const handleExternalShare = (platform: string) => {
    const postUrl = `${window.location.origin}/post/${post.postId}`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.caption || '')}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${post.caption || ''} ${postUrl}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard');
        setShowShareMenu(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      handleShare('EXTERNAL', platform);
    }
  };

  const renderMedia = () => {
    if (post.mediaUrls.length === 0) return null;

    if (post.postType === 'CAROUSEL') {
      return (
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg">
            {post.mediaUrls[currentMediaIndex]?.includes('.mp4') ||
            post.mediaUrls[currentMediaIndex]?.includes('video') ? (
              <video
                src={post.mediaUrls[currentMediaIndex]}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={post.mediaUrls[currentMediaIndex]}
                alt="Post media"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Carousel indicators */}
          {post.mediaUrls.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {post.mediaUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Navigation arrows */}
              {currentMediaIndex > 0 && (
                <button
                  onClick={() => setCurrentMediaIndex(prev => prev - 1)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  ←
                </button>
              )}
              {currentMediaIndex < post.mediaUrls.length - 1 && (
                <button
                  onClick={() => setCurrentMediaIndex(prev => prev + 1)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  →
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    const mediaUrl = post.mediaUrls[0];
    return (
      <div className="aspect-square overflow-hidden rounded-lg">
        {post.postType === 'VIDEO' || mediaUrl?.includes('.mp4') || mediaUrl?.includes('video') ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.profilePhotoUrl || '/api/placeholder/40/40'}
            alt={post.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{post.fullName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>@{post.username}</span>
              <span>•</span>
              <span>{formatTimestamp(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-gray-900">{post.caption}</p>
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Engagement */}
      <div className="p-4">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>{likesCount} likes</span>
          <span>{post.commentsCount} comments</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Like</span>
            </button>
            
            <button
              onClick={() => onComment?.(post.postId)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              {/* Share menu */}
              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                  <button
                    onClick={() => handleShare('DIRECT')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Send to friends
                  </button>
                  <button
                    onClick={() => handleShare('STORY')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Share to story
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => handleExternalShare('twitter')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleExternalShare('facebook')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleExternalShare('whatsapp')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={() => handleExternalShare('copy')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Copy link
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className={`transition-colors ${
              isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostCard;