import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  variant?: 'default' | 'modern' | 'glass';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  autoExpand?: boolean;
  maxLines?: number;
  variant?: 'default' | 'modern' | 'glass';
  label?: string;
}

interface ChatInputProps extends InputProps {
  onSend?: () => void;
  sendDisabled?: boolean;
}

// Enhanced Input Component with modern design
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    error, 
    helperText, 
    variant = 'modern',
    leftIcon,
    rightIcon,
    label,
    ...props 
  }, ref) => {
    const variants = {
      default: 'border-slate-300 focus:ring-blue-500 focus:border-blue-500',
      modern: 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300',
      glass: 'border-white/20 bg-white/10 backdrop-blur-md focus:bg-white/20 focus:ring-blue-500 focus:border-blue-500',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            className={clsx(
              // Base styles
              'w-full h-12 px-4 py-3 rounded-xl border transition-all duration-200',
              'text-sm placeholder:text-slate-400 text-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              
              // Variant styles
              error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                : variants[variant],
              
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              // Disabled styles
              'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200',
              
              className
            )}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <motion.p 
            className={clsx(
              'mt-2 text-xs',
              error ? 'text-red-600' : 'text-slate-500'
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component - Auto-expand to 3 lines for chat
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, autoExpand = false, maxLines = 3, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={clsx(
            // Base styles
            'w-full px-4 py-3 rounded-lg border transition-colors resize-none',
            'text-sm placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            
            // Auto-expand styles
            autoExpand ? 'min-h-[3rem] max-h-[6rem]' : 'h-24',
            
            // Error styles
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500',
            
            // Disabled styles
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            
            className
          )}
          rows={autoExpand ? 1 : 3}
          style={autoExpand ? { 
            maxHeight: `${maxLines * 1.5}rem`,
            overflow: 'hidden'
          } : undefined}
          {...props}
        />
        {helperText && (
          <p className={clsx(
            'mt-1 text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Enhanced Chat Input Component with modern design
export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSend, sendDisabled, className, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50">
        <div className="flex-1">
          <Input
            ref={ref}
            variant="modern"
            className={clsx('h-12 border-slate-200', className)}
            placeholder="Type a message..."
            {...props}
          />
        </div>
        
        <motion.button
          onClick={onSend}
          disabled={sendDisabled}
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            sendDisabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
          )}
          whileHover={!sendDisabled ? { scale: 1.05 } : undefined}
          whileTap={!sendDisabled ? { scale: 0.95 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {/* Shimmer effect */}
          {!sendDisabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          )}
          
          <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </motion.button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default Input;