import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: Date | string | number) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | number) {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isYesterday(date: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

export function formatRelativeTime(date: Date | string | number) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (isToday(new Date(date))) return 'Today';
  if (isYesterday(new Date(date))) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return formatDate(date);
}

export function truncate(str: string, length: number) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .join('')
    .substring(0, 2);
}
