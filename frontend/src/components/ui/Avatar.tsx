import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'chat' | 'post' | 'profile';
  online?: boolean;
  className?: string;
  fallback?: string;
  gradient?: boolean;
  ring?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
  interactive?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6', // 24px
  sm: 'w-8 h-8', // 32px
  md: 'w-10 h-10', // 40px
  lg: 'w-12 h-12', // 48px
  xl: 'w-16 h-16', // 64px
  '2xl': 'w-20 h-20', // 80px
  chat: 'w-10 h-10', // 40px for chat list
  post: 'w-9 h-9', // 36px for posts
  profile: 'w-24 h-24 lg:w-32 lg:h-32', // 96px mobile, 128px desktop
};

const statusColors = {
  online: 'bg-emerald-500 shadow-emerald-200',
  away: 'bg-amber-500 shadow-amber-200',
  busy: 'bg-red-500 shadow-red-200',
  offline: 'bg-slate-400 shadow-slate-200',
};

export const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  online = false, 
  className,
  fallback,
  gradient = false,
  ring = false,
  status,
  interactive = false
}: AvatarProps) => {
  const sizeClass = sizeClasses[size];
  const actualStatus = status || (online ? 'online' : undefined);
  
  const avatarContent = src ? (
    <img
      src={src}
      alt={alt}
      className={clsx(
        sizeClass,
        'rounded-full object-cover transition-all duration-200',
        ring && 'ring-2 ring-white shadow-lg',
        interactive && 'hover:scale-105'
      )}
    />
  ) : (
    <div className={clsx(
      sizeClass,
      'rounded-full flex items-center justify-center transition-all duration-200',
      gradient 
        ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white shadow-lg'
        : 'bg-slate-200 text-slate-600 border border-slate-300',
      ring && 'ring-2 ring-white shadow-lg',
      interactive && 'hover:scale-105'
    )}>
      <span className={clsx(
        'font-semibold',
        size === 'xs' && 'text-xs',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        size === 'xl' && 'text-lg',
        size === '2xl' && 'text-xl',
        size === 'chat' && 'text-sm',
        size === 'post' && 'text-sm',
        size === 'profile' && 'text-2xl lg:text-4xl'
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <motion.div 
      className={clsx('relative inline-block', className)}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Gradient ring effect */}
      {ring && (
        <div className={clsx(
          'absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-0.5',
          interactive && 'group-hover:from-blue-500 group-hover:via-purple-600 group-hover:to-pink-600'
        )}>
          <div className={clsx(sizeClass, 'rounded-full bg-white')} />
        </div>
      )}
      
      {/* Avatar content */}
      <div className="relative z-10">
        {avatarContent}
      </div>
      
      {/* Status indicator */}
      {actualStatus && (
        <motion.div 
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white shadow-lg',
            statusColors[actualStatus],
            size === 'xs' && 'w-2 h-2',
            size === 'sm' && 'w-2.5 h-2.5',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-3.5 h-3.5',
            size === 'xl' && 'w-4 h-4',
            size === '2xl' && 'w-5 h-5',
            size === 'chat' && 'w-3 h-3',
            size === 'post' && 'w-2.5 h-2.5',
            size === 'profile' && 'w-6 h-6 lg:w-8 lg:h-8'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
        />
      )}

      {/* Pulse animation for online status */}
      {actualStatus === 'online' && (
        <div className={clsx(
          'absolute bottom-0 right-0 rounded-full bg-emerald-500 animate-ping opacity-75',
          size === 'xs' && 'w-2 h-2',
          size === 'sm' && 'w-2.5 h-2.5',
          size === 'md' && 'w-3 h-3',
          size === 'lg' && 'w-3.5 h-3.5',
          size === 'xl' && 'w-4 h-4',
          size === '2xl' && 'w-5 h-5',
          size === 'chat' && 'w-3 h-3',
          size === 'post' && 'w-2.5 h-2.5',
          size === 'profile' && 'w-6 h-6 lg:w-8 lg:h-8'
        )}
      />
      )}
    </motion.div>
  );
};

export default Avatar;