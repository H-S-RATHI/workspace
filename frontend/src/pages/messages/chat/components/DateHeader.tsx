import { cn } from './utils';

interface DateHeaderProps {
  date: string;
}

// Format message date header
export const formatMessageDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export const DateHeader = ({ date }: DateHeaderProps) => (
  <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2 text-center">
    <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
      {formatMessageDate(new Date(date))}
    </span>
  </div>
);

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

function format(date: Date, formatStr: string): string {
  // Simple format implementation - in a real app, use date-fns or similar
  const options: Intl.DateTimeFormatOptions = {};
  
  if (formatStr.includes('MMMM')) {
    options.month = 'long';
  }
  if (formatStr.includes('d')) {
    options.day = 'numeric';
  }
  if (formatStr.includes('yyyy')) {
    options.year = 'numeric';
  }
  
  return date.toLocaleDateString(undefined, options);
}
