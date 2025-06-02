import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Compass, 
  ShoppingBag,
  User,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    color: 'blue'
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    color: 'purple'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    color: 'green'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    color: 'orange'
  },
];

const DesktopSidebar = ({ collapsed, onToggleCollapse }: DesktopSidebarProps) => {
  const { handleLogout } = useAuthStore();
  const location = useLocation();
  
  const isTabActive = (path: string) => location.pathname.startsWith(path);

  const getColorClasses = (color: string, active: boolean) => {
    const colors = {
      blue: active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-700',
      purple: active ? 'bg-purple-50 text-purple-700 border-purple-200' : 'hover:bg-purple-50 hover:text-purple-700',
      green: active ? 'bg-green-50 text-green-700 border-green-200' : 'hover:bg-green-50 hover:text-green-700',
      orange: active ? 'bg-orange-50 text-orange-700 border-orange-200' : 'hover:bg-orange-50 hover:text-orange-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">SocialApp</h1>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={clsx(
                  'flex items-center rounded-xl transition-all duration-200 group relative',
                  collapsed ? 'p-3 justify-center' : 'p-4',
                  active 
                    ? `${getColorClasses(tab.color, true)} border shadow-sm` 
                    : `text-gray-700 ${getColorClasses(tab.color, false)}`
                )}
              >
                <Icon 
                  className={clsx(
                    'w-6 h-6 transition-colors',
                    active ? `text-${tab.color}-600` : 'text-gray-500 group-hover:text-current'
                  )} 
                />
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 font-medium"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {tab.label}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group',
            collapsed ? 'p-3 justify-center' : 'p-4'
          )}
        >
          <LogOut className="w-6 h-6" />
          
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-medium"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Log out
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default DesktopSidebar