import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Compass, 
  ShoppingBag,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    badge: 3,
    color: 'blue'
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    badge: 0,
    color: 'purple'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    badge: 0,
    color: 'green'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    badge: 0,
    color: 'orange'
  },
];

const MobileNavigation = () => {
  const location = useLocation();
  
  // Check if current path matches the tab path
  const isTabActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-around px-4 shadow-lg relative">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm"></div>
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.path);
        
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className="relative z-10 flex flex-col items-center justify-center py-2 px-3 min-w-[60px] group"
          >
            {/* Active indicator background */}
            {active && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-100 rounded-2xl"
                initial={false}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Icon container */}
              <div className={clsx(
                'relative p-2 rounded-xl transition-all duration-200',
                active 
                  ? 'bg-white shadow-md transform -translate-y-1' 
                  : 'group-hover:bg-gray-50'
              )}>
                <Icon 
                  size={24} 
                  className={clsx(
                    'transition-colors duration-200',
                    active 
                      ? getColorClasses(tab.color)
                      : 'text-gray-500 group-hover:text-gray-700'
                  )} 
                />
                
                {/* Badge */}
                {tab.badge > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full text-xs font-bold text-white bg-red-500 border-2 border-white shadow-sm"
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </motion.span>
                )}
              </div>
              
              {/* Label */}
              <span className={clsx(
                'text-xs font-medium mt-1 transition-colors duration-200',
                active 
                  ? getColorClasses(tab.color)
                  : 'text-gray-500 group-hover:text-gray-700'
              )}>
                {tab.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNavigation;