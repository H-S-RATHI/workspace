import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Compass, 
  Bell,
  PlusCircle,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/home',
    badge: 0
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    badge: 3
  },
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    path: '/create',
    badge: 0
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    badge: 0
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    badge: 5
  },
];

const MobileNavigation = () => {
  const location = useLocation();
  
  // Check if current path matches the tab path
  const isTabActive = (path: string) => {
    if (path === '/home') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around px-1 sm:px-4 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isTabActive(tab.path);
        const isCreateButton = tab.id === 'create';
        
        return (
          <div key={tab.id} className="relative flex-1 flex justify-center">
            {isCreateButton ? (
              <Link
                to={tab.path}
                className={clsx(
                  'flex flex-col items-center justify-center p-2 rounded-full transition-all',
                  'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
                  'transform -translate-y-4 w-14 h-14 shadow-lg hover:shadow-xl',
                  'hover:scale-105 active:scale-95'
                )}
              >
                <Icon size={24} className="fill-current" />
              </Link>
            ) : (
              <Link
                to={tab.path}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative',
                  'flex-1',
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
                        active ? 'fill-current' : 'stroke-1',
                        tab.badge > 0 ? 'mr-1' : ''
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileNavigation;