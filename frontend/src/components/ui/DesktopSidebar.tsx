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
  ChevronRight,
  Sparkles,
  TrendingUp,
  Heart,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { getGradientClasses } from '../../styles/colors';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentTab: string;
}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    color: 'sky',
    gradient: 'from-sky-400 to-blue-500',
    description: 'Chat with friends'
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    color: 'purple',
    gradient: 'from-violet-500 to-purple-500',
    description: 'Explore content'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-500',
    description: 'Buy and sell'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    color: 'orange',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Your account'
  },
];

const quickActions = [
  {
    id: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    color: 'text-pink-500',
    bg: 'bg-pink-50 hover:bg-pink-100'
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-50 hover:bg-red-100'
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: Bookmark,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 hover:bg-indigo-100'
  },
];

const DesktopSidebar = ({ collapsed, onToggleCollapse, currentTab }: DesktopSidebarProps) => {
  const { handleLogout, user } = useAuthStore();
  const location = useLocation();
  
  const isTabActive = (path: string) => location.pathname.startsWith(path);

  const getTabStyles = (tab: any, active: boolean) => {
    if (active) {
      return {
        container: `bg-gradient-to-r ${tab.gradient} shadow-lg shadow-${tab.color}-200/50`,
        text: 'text-white',
        icon: 'text-white'
      };
    }
    return {
      container: `hover:bg-${tab.color}-50 hover:shadow-md`,
      text: 'text-slate-600 hover:text-slate-900',
      icon: 'text-slate-500 hover:text-slate-700'
    };
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header with modern design */}
      <div className="flex items-center justify-between p-4">
        
        
        <motion.button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-700" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-slate-700" />
          )}
        </motion.button>
      </div>

      {/* User Profile Section */}
 
      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-3">
          {/* Section Label */}
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Navigation
              </p>
            </div>
          )}

          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            const styles = getTabStyles(tab, active);
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={tab.path}
                  className={clsx(
                    'flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden',
                    collapsed ? 'p-3 justify-center' : 'p-4',
                    styles.container
                  )}
                >
                  {/* Active background glow */}
                  {active && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-10 rounded-2xl`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center w-full">
                    <Icon 
                      className={clsx(
                        'w-6 h-6 transition-all duration-300',
                        styles.icon
                      )} 
                    />
                    
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 flex-1"
                        >
                          <span className={clsx('font-semibold text-sm', styles.text)}>
                            {tab.label}
                          </span>
                          <p className={clsx(
                            'text-xs mt-0.5',
                            active ? 'text-white/80' : 'text-slate-400'
                          )}>
                            {tab.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Modern tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs text-slate-300 mt-1">{tab.description}</div>
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="px-3 py-2 mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    className={clsx(
                      'w-full flex items-center p-3 rounded-xl transition-all duration-200 group',
                      action.bg
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', action.color)} />
                    <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </nav>
      
      {/* Footer with modern logout */}
      <div className="p-4 border-t border-slate-200/50">
        <motion.button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center rounded-2xl text-red-600 hover:bg-red-50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden',
            collapsed ? 'p-3 justify-center' : 'p-4'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          
          <div className="relative z-10 flex items-center w-full">
            <LogOut className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <span className="font-semibold text-sm">Log out</span>
                  <p className="text-xs text-red-400 mt-0.5">Sign out safely</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modern tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-4 py-3 bg-red-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              <div className="font-semibold">Log out</div>
              <div className="text-xs text-red-200 mt-1">Sign out safely</div>
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
            </div>
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default DesktopSidebar