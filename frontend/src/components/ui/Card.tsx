import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  rating?: number;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

interface ConversationCardProps {
  avatar: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  className?: string;
  onClick?: () => void;
}

interface PostCardProps {
  avatar: string;
  name: string;
  username: string;
  media?: string;
  caption: string;
  likes?: number;
  comments?: number;
  timestamp: string;
  className?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

// Base Card Component
export const Card = ({ children, className, hover = false, onClick }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200',
        'shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Product Card - Square image, title (2 lines max), price, ratings
export const ProductCard = ({ 
  image, 
  title, 
  price, 
  rating, 
  badge, 
  className, 
  onClick 
}: ProductCardProps) => {
  return (
    <Card 
      className={clsx('overflow-hidden', className)} 
      hover 
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[165px] lg:h-[300px] object-cover"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
            {badge}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm lg:text-base truncate-2 mb-1">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{price}</span>
          {rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 ml-1">{rating}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Conversation Card - Avatar + name + last message + timestamp
export const ConversationCard = ({
  avatar,
  name,
  lastMessage,
  timestamp,
  unread = false,
  className,
  onClick
}: ConversationCardProps) => {
  return (
    <Card 
      className={clsx('p-4', className)} 
      hover 
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {unread && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={clsx(
              'text-sm font-medium truncate',
              unread ? 'text-gray-900' : 'text-gray-700'
            )}>
              {name}
            </h3>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
          <p className={clsx(
            'text-sm truncate mt-1',
            unread ? 'text-gray-900 font-medium' : 'text-gray-500'
          )}>
            {lastMessage}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Post Card - Header (avatar/name) + media + caption + actions
export const PostCard = ({
  avatar,
  name,
  username,
  media,
  caption,
  likes = 0,
  comments = 0,
  timestamp,
  className,
  isLiked = false,
  onLike,
  onComment,
  onShare
}: PostCardProps) => {
  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={avatar} 
            alt={name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">@{username} • {timestamp}</p>
          </div>
        </div>
      </div>

      {/* Media */}
      {media && (
        <div className="relative">
          <img 
            src={media} 
            alt="Post content"
            className="w-full max-h-96 object-cover"
            style={{ aspectRatio: '4/5', maxAspectRatio: '4/5' }}
          />
        </div>
      )}

      {/* Caption and Actions */}
      <div className="p-4 pt-3">
        <p className="text-sm text-gray-900 mb-3">{caption}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLike}
              className={clsx(
                "flex items-center space-x-1 transition-colors",
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              )}
            >
              <span className="text-lg">{isLiked ? '❤️' : '♡'}</span>
              <span className="text-sm">{likes}</span>
            </button>
            <button 
              onClick={onComment}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm">{comments}</span>
            </button>
          </div>
          <button 
            onClick={onShare}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-lg">📤</span>
          </button>
        </div>
      </div>
    </Card>
  );
};