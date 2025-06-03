import { cn } from './utils';

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export const EmptyState = ({
  title = "No messages yet",
  message = "Start the conversation by sending your first message",
  className = ""
}: EmptyStateProps) => (
  <div className={cn(
    "flex-1 flex flex-col items-center justify-center text-center p-6",
    className
  )}>
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
      <span className="text-2xl">💬</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">
      {message}
    </p>
  </div>
);

// Typing indicator component
export const TypingIndicator = () => (
  <div className="flex items-center space-x-1 px-4 py-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);
