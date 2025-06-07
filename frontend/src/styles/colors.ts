// Modern Design System - Enhanced Color Palette
export const colors = {
  // Primary Brand Colors - Modern Blue Gradient System
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand blue - more vibrant
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Section Colors - Modern Gradient System
  messages: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    lightGradient: 'from-sky-50 via-blue-50 to-indigo-50',
    glass: 'from-sky-400/20 via-blue-500/20 to-indigo-600/20',
    accent: '#06b6d4', // Cyan accent
  },

  discover: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    lightGradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
    glass: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
    accent: '#ec4899', // Pink accent
  },

  marketplace: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    gradient: 'from-emerald-400 via-teal-500 to-green-600',
    lightGradient: 'from-emerald-50 via-teal-50 to-green-50',
    glass: 'from-emerald-400/20 via-teal-500/20 to-green-600/20',
    accent: '#14b8a6', // Teal accent
  },

  profile: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    lightGradient: 'from-amber-50 via-orange-50 to-red-50',
    glass: 'from-amber-400/20 via-orange-500/20 to-red-500/20',
    accent: '#f59e0b', // Amber accent
  },

  // Status Colors - Enhanced with modern palette
  status: {
    online: '#22c55e',
    away: '#f59e0b',
    busy: '#ef4444',
    offline: '#64748b',
    dnd: '#dc2626',
  },

  // Neutral Colors - Modern gray scale
  gray: {
    25: '#fcfcfd',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic Colors - Modern and accessible
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Chat Colors - Modern messaging design
  chat: {
    sent: 'from-sky-400 via-blue-500 to-indigo-600',
    received: '#ffffff',
    timestamp: '#64748b',
    online: '#22c55e',
    typing: '#f59e0b',
    bubble: {
      sent: 'bg-gradient-to-r from-sky-400 to-blue-500',
      received: 'bg-white border border-gray-200',
      sentText: 'text-white',
      receivedText: 'text-gray-900',
    }
  },

  // Background Colors - Modern layered system
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    quaternary: '#e2e8f0',
    dark: '#0f172a',
    glass: 'rgba(255, 255, 255, 0.8)',
    glassDark: 'rgba(15, 23, 42, 0.8)',
  },

  // Glass morphism effects
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    medium: 'rgba(255, 255, 255, 0.18)',
    dark: 'rgba(0, 0, 0, 0.25)',
    blur: 'backdrop-blur-md',
    border: 'rgba(255, 255, 255, 0.18)',
  },

  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgb(59 130 246 / 0.5)',
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

// Helper function to get gradient classes - Enhanced for modern design
export const getGradientClasses = (section: string) => {
  const sectionColors = getSectionColors(section);
  return {
    gradient: `bg-gradient-to-r ${sectionColors.gradient}`,
    lightGradient: `bg-gradient-to-br ${sectionColors.lightGradient}`,
    glassGradient: `bg-gradient-to-br ${sectionColors.glass}`,
    text: getSectionTextColor(section),
    bg: getSectionBgColor(section),
    accent: sectionColors.accent,
    border: getSectionBorderColor(section),
  };
};

// Helper function to get section-specific text colors
export const getSectionTextColor = (section: string) => {
  switch (section) {
    case 'messages':
      return 'text-sky-600';
    case 'discover':
      return 'text-purple-600';
    case 'marketplace':
      return 'text-emerald-600';
    case 'profile':
      return 'text-orange-600';
    default:
      return 'text-blue-600';
  }
};

// Helper function to get section-specific background colors
export const getSectionBgColor = (section: string) => {
  switch (section) {
    case 'messages':
      return 'bg-sky-50';
    case 'discover':
      return 'bg-purple-50';
    case 'marketplace':
      return 'bg-emerald-50';
    case 'profile':
      return 'bg-orange-50';
    default:
      return 'bg-blue-50';
  }
};

// Helper function to get section-specific border colors
export const getSectionBorderColor = (section: string) => {
  switch (section) {
    case 'messages':
      return 'border-sky-200';
    case 'discover':
      return 'border-purple-200';
    case 'marketplace':
      return 'border-emerald-200';
    case 'profile':
      return 'border-orange-200';
    default:
      return 'border-blue-200';
  }
};

// Modern design utilities
export const designUtils = {
  // Glass morphism effect
  glass: (opacity = 0.25) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  }),
  
  // Gradient text effect
  gradientText: (section: string) => {
    const sectionColors = getSectionColors(section);
    return `bg-gradient-to-r ${sectionColors.gradient} bg-clip-text text-transparent`;
  },
  
  // Modern shadow system
  shadow: {
    soft: 'shadow-lg shadow-gray-200/50',
    medium: 'shadow-xl shadow-gray-300/25',
    strong: 'shadow-2xl shadow-gray-400/20',
    colored: (section: string) => {
      switch (section) {
        case 'messages':
          return 'shadow-lg shadow-sky-200/50';
        case 'discover':
          return 'shadow-lg shadow-purple-200/50';
        case 'marketplace':
          return 'shadow-lg shadow-emerald-200/50';
        case 'profile':
          return 'shadow-lg shadow-orange-200/50';
        default:
          return 'shadow-lg shadow-blue-200/50';
      }
    }
  },
  
  // Modern border radius system
  radius: {
    xs: 'rounded-md',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },
};