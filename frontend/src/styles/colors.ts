// Comprehensive Color System for the App
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary Colors for Different Sections
  messages: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'from-blue-50 to-indigo-50',
  },

  discover: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
    gradient: 'from-purple-500 to-pink-600',
    light: 'from-purple-50 to-pink-50',
  },

  marketplace: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    gradient: 'from-emerald-500 to-green-600',
    light: 'from-emerald-50 to-green-50',
  },

  profile: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c',
    gradient: 'from-orange-500 to-red-600',
    light: 'from-orange-50 to-red-50',
  },

  // Status Colors
  status: {
    online: '#10b981',
    away: '#f59e0b',
    busy: '#ef4444',
    offline: '#6b7280',
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Chat Colors
  chat: {
    sent: 'from-blue-500 to-indigo-600',
    received: '#ffffff',
    timestamp: '#6b7280',
    online: '#10b981',
    typing: '#f59e0b',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#1f2937',
  },
};

// Helper function to get section colors
export const getSectionColors = (section: string) => {
  switch (section) {
    case 'messages':
      return colors.messages;
    case 'discover':
      return colors.discover;
    case 'marketplace':
      return colors.marketplace;
    case 'profile':
      return colors.profile;
    default:
      return colors.primary;
  }
};

// Helper function to get gradient classes
export const getGradientClasses = (section: string) => {
  const sectionColors = getSectionColors(section);
  return {
    gradient: `bg-gradient-to-r ${sectionColors.gradient}`,
    lightGradient: `bg-gradient-to-r ${sectionColors.light}`,
    text: `text-${section === 'messages' ? 'blue' : section === 'discover' ? 'purple' : section === 'marketplace' ? 'emerald' : 'orange'}-600`,
    bg: `bg-${section === 'messages' ? 'blue' : section === 'discover' ? 'purple' : section === 'marketplace' ? 'emerald' : 'orange'}-50`,
  };
};