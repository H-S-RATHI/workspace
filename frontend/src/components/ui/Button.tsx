import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  floating: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12',
  icon: 'w-12 h-12 p-0', // 48x48px minimum touch targets
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        variantClasses[variant],
        
        // Size styles
        sizeClasses[size],
        
        // Floating action button specific styles
        variant === 'floating' && 'rounded-full',
        
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ 
  children, 
  className, 
  ...props 
}: Omit<ButtonProps, 'variant' | 'size'>) => {
  return (
    <Button
      variant="floating"
      size="icon"
      className={clsx('fixed bottom-20 right-4 z-50', className)}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;