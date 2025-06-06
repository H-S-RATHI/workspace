import { format, isToday, isYesterday } from 'date-fns';

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
