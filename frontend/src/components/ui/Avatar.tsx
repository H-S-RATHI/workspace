import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'chat' | 'post' | 'profile';
  online?: boolean;
  className?: string;
  fallback?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8', // 32px
  md: 'w-9 h-9', // 36px for posts
  lg: 'w-10 h-10', // 40px for chat list
  xl: 'w-16 h-16', // 64px
  chat: 'w-10 h-10', // 40px for chat list
  post: 'w-9 h-9', // 36px for posts
  profile: 'w-25 h-25 lg:w-32 lg:h-32', // 100px mobile, 128px desktop
};

export const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  online = false, 
  className,
  fallback 
}: AvatarProps) => {
  const sizeClass = sizeClasses[size];
  
  return (
    <div className={clsx('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            sizeClass,
            'rounded-full object-cover border border-gray-200'
          )}
        />
      ) : (
        <div className={clsx(
          sizeClass,
          'rounded-full bg-gray-200 flex items-center justify-center border border-gray-200'
        )}>
          <span className={clsx(
            'text-gray-600 font-medium',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-sm',
            size === 'xl' && 'text-lg',
            size === 'profile' && 'text-2xl lg:text-4xl'
          )}>
            {fallback || alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      {online && (
        <div className={clsx(
          'absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500',
          size === 'sm' && 'w-2 h-2',
          size === 'md' && 'w-2.5 h-2.5',
          size === 'lg' && 'w-3 h-3',
          size === 'xl' && 'w-4 h-4',
          size === 'profile' && 'w-6 h-6 lg:w-8 lg:h-8'
        )}
      />
      )}
    </div>
  );
};

export default Avatar;