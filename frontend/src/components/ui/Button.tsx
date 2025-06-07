import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'floating' | 'gradient' | 'glass' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  className?: string;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: string;
  glow?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 border border-slate-200 hover:border-slate-300',
  outline: 'border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-blue-500',
  ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
  floating: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
  gradient: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50',
  glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-300/50',
};

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs h-7 rounded-lg',
  sm: 'px-3 py-1.5 text-sm h-8 rounded-lg',
  md: 'px-4 py-2 text-sm h-10 rounded-xl',
  lg: 'px-6 py-3 text-base h-12 rounded-xl',
  xl: 'px-8 py-4 text-lg h-14 rounded-2xl',
  icon: 'w-12 h-12 p-0 rounded-xl', // 48x48px minimum touch targets
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  gradient,
  glow = false,
  ...props
}: ButtonProps) => {
  const isGradientVariant = variant === 'primary' || variant === 'gradient' || variant === 'danger' || variant === 'floating';
  const glowEffect = glow ? 'hover:animate-glow' : '';

  return (
    <motion.button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-semibold transition-all duration-200 relative overflow-hidden group',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        gradient && variant === 'gradient' ? `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl` : variantClasses[variant],
        
        // Size styles
        sizeClasses[size],
        
        // Floating action button specific styles
        variant === 'floating' && 'rounded-full',
        
        // Glow effect
        glowEffect,
        
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Shimmer effect for gradient buttons */}
      {isGradientVariant && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}

      {loading ? (
        <div className="flex items-center relative z-10">
          <motion.div 
            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          Loading...
        </div>
      ) : (
        <div className="flex items-center relative z-10">
          {/* Left icon */}
          {icon && iconPosition === 'left' && (
            <span className="mr-2 flex-shrink-0">
              {icon}
            </span>
          )}
          
          {children}
          
          {/* Right icon */}
          {icon && iconPosition === 'right' && (
            <span className="ml-2 flex-shrink-0">
              {icon}
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
};

// Floating Action Button with enhanced design
export const FloatingActionButton = ({ 
  children, 
  className,
  gradient,
  ...props 
}: Omit<ButtonProps, 'variant' | 'size'>) => {
  return (
    <Button
      variant="floating"
      size="icon"
      gradient={gradient}
      glow={true}
      className={clsx('fixed bottom-20 right-4 z-50 shadow-2xl', className)}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;