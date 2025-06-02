import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Compass, ShoppingBag, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

interface DesktopSidebarProps {}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    description: 'Chat with friends',
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    description: 'Explore content',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    description: 'Buy and sell',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    description: 'Your account',
  },
];

const DesktopSidebar = ({}: DesktopSidebarProps) => {
  const { handleLogout } = useAuthStore();
  const location = useLocation();
  
  const isTabActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 w-64">
      {/* Logo/Brand */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SocialApp
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            
            return (
              <li key={tab.id}>
                <Link
                  to={tab.path}
                  className={clsx(
                    'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon 
                    className={clsx(
                      'w-5 h-5 mr-3',
                      active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    )} 
                  />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute right-4 w-1.5 h-6 bg-blue-600 rounded-full"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default DesktopSidebar