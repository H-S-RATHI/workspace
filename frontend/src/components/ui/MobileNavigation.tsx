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
    badge: 3
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    badge: 0
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    badge: 0
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    badge: 0
  },
];

const MobileNavigation = () => {
  const location = useLocation();
  
  // Check if current path matches the tab path
  const isTabActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.path);
        
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={clsx(
              'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative',
              'min-w-[48px] min-h-[48px]', // 48x48px minimum touch targets
              active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {active && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute inset-0 bg-blue-50 rounded-lg"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <Icon 
                  size={22} 
                  className={clsx(
                    active ? 'fill-current' : 'stroke-1'
                  )} 
                />
                {tab.badge > 0 && (
                  <span className={clsx(
                    'absolute -top-1 -right-2 flex items-center justify-center',
                    'h-5 min-w-[1.25rem] px-1 rounded-full text-xs font-medium text-white',
                    'bg-red-500 border-2 border-white'
                  )}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={clsx(
                'text-xs font-medium mt-1',
                active ? 'text-blue-600' : 'text-gray-500'
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