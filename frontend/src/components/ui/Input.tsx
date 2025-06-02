import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  autoExpand?: boolean;
  maxLines?: number;
}

interface ChatInputProps extends InputProps {
  onSend?: () => void;
  sendDisabled?: boolean;
}

// Base Input Component - 50px height for chat
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={clsx(
            // Base styles
            'w-full h-12 px-4 py-3 rounded-lg border transition-colors',
            'text-sm placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            
            // Error styles
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500',
            
            // Disabled styles
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            
            className
          )}
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

// Chat Input Component - 50px height with send button
export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSend, sendDisabled, className, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2 p-4 bg-white border-t border-gray-200">
        <div className="flex-1">
          <Input
            ref={ref}
            className={clsx('h-12', className)}
            placeholder="Type a message..."
            {...props}
          />
        </div>
        <button
          onClick={onSend}
          disabled={sendDisabled}
          className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            sendDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default Input;