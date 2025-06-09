import { format, parseISO, isToday, isYesterday } from 'date-fns';
/**
 * Format date for display in date headers
 */
export const formatDateForHeader = (date: string): string | null => {
  try {
    const dateObj = parseISO(date);
    
    if (isToday(dateObj)) {
      return 'Today';
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return format(dateObj, 'MMMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};