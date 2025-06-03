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
  <div className="flex justify-center items-center my-4">
    <span className="px-4 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full shadow-sm tracking-wide border border-blue-200">
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
