import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'shimmer' | 'wave';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Skeleton = ({
  className,
  variant = 'shimmer',
  rounded = 'md',
  ...props
}: SkeletonProps) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const variants = {
    default: 'animate-pulse bg-slate-200',
    shimmer: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-shimmer',
    wave: 'bg-slate-200 animate-pulse',
  };

  if (variant === 'shimmer') {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-slate-200',
          roundedClasses[rounded],
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        variants[variant],
        roundedClasses[rounded],
        className
      )}
      {...props}
    />
  );
};

// Predefined skeleton components for common use cases
const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-4 space-y-3', className)} {...props}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const SkeletonAvatar = ({ 
  size = 'md',
  className,
  ...props 
}: SkeletonProps & { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      rounded="full"
      {...props}
    />
  );
};

const SkeletonText = ({ 
  lines = 3,
  className,
  ...props 
}: SkeletonProps & { lines?: number }) => (
  <div className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-24', className)} rounded="lg" {...props} />
);

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonText, 
  SkeletonButton 
};
