import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  interactive?: boolean;
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

// Base Card Component with modern design
export const Card = ({ 
  children, 
  className, 
  hover = false, 
  onClick, 
  variant = 'default',
  interactive = false
}: CardProps) => {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm hover:shadow-lg',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl',
    elevated: 'bg-white border border-slate-200 shadow-xl hover:shadow-2xl',
  };

  return (
    <motion.div
      className={clsx(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        (hover || interactive) && 'hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Product Card - Enhanced with modern design
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
      className={clsx('overflow-hidden group', className)} 
      variant="elevated"
      interactive
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[165px] lg:h-[300px] object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {badge && (
          <motion.div 
            className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
          >
            {badge}
          </motion.div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm lg:text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {price}
          </span>
          {rating && (
            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-sm text-amber-600 ml-1 font-medium">{rating}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Conversation Card - Enhanced with modern design
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
      className={clsx('p-4 group', className)} 
      variant={unread ? 'gradient' : 'default'}
      interactive
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg transition-transform group-hover:scale-105"
          />
          {unread && (
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={clsx(
              'text-sm font-semibold truncate transition-colors',
              unread ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
            )}>
              {name}
            </h3>
            <span className={clsx(
              'text-xs transition-colors',
              unread ? 'text-blue-600 font-medium' : 'text-slate-500'
            )}>
              {timestamp}
            </span>
          </div>
          
          <p className={clsx(
            'text-sm truncate transition-colors',
            unread 
              ? 'text-slate-700 font-medium' 
              : 'text-slate-500 group-hover:text-slate-600'
          )}>
            {lastMessage}
          </p>
        </div>
      </div>
      
      {/* Unread indicator bar */}
      {unread && (
        <motion.div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
        />
      )}
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