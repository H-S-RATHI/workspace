import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Compass, 
  ShoppingBag,
  User,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { getSectionTextColor, getGradientClasses } from '../../styles/colors';

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    badge: 3,
    color: 'sky',
    gradient: 'from-sky-400 to-blue-500'
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    badge: 0,
    color: 'purple',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    badge: 0,
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    badge: 0,
    color: 'orange',
    gradient: 'from-amber-400 to-orange-500'
  },
];

const MobileNavigation = () => {
  const location = useLocation();
  
  // Check if current path matches the tab path
  const isTabActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getTabGradient = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.gradient || 'from-blue-400 to-blue-500';
  };

  return (
    <div className="relative">
      {/* Main Navigation Container */}
      <div className="h-20 flex items-center justify-around px-2 relative">
        {/* Floating Active Background */}
        <AnimatePresence>
          {tabs.map((tab) => {
            const active = isTabActive(tab.path);
            if (!active) return null;
            
            return (
              <motion.div
                key={`bg-${tab.id}`}
                layoutId="mobile-active-bg"
                className={`absolute w-16 h-16 bg-gradient-to-br ${tab.gradient} rounded-2xl opacity-10`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                style={{
                  left: `${tabs.findIndex(t => t.id === tab.id) * 25 + 12.5}%`,
                  transform: 'translateX(-50%)',
                }}
              />
            );
          })}
        </AnimatePresence>
        
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.path);
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[70px] group"
            >
              {/* Icon container with modern design */}
              <motion.div 
                className="relative"
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Active glow effect */}
                {active && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-lg opacity-30`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Icon background */}
                <div className={clsx(
                  'relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                  active 
                    ? `bg-gradient-to-br ${tab.gradient} shadow-lg shadow-${tab.color}-200/50` 
                    : 'bg-slate-100 hover:bg-slate-200 group-hover:scale-105'
                )}>
                  <Icon 
                    size={22} 
                    className={clsx(
                      'transition-all duration-300',
                      active 
                        ? 'text-white' 
                        : 'text-slate-600 group-hover:text-slate-700'
                    )}
                  />
                  
                  {/* Badge with modern design */}
                  {tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center"
                    >
                      <div className="relative">
                        {/* Badge glow */}
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-60"></div>
                        {/* Badge content */}
                        <span className="relative flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full text-xs font-bold text-white bg-red-500 border-2 border-white shadow-lg">
                          {tab.badge > 9 ? '9+' : tab.badge}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Label with enhanced typography */}
              <motion.span 
                className={clsx(
                  'text-xs font-semibold mt-2 transition-all duration-300',
                  active 
                    ? `bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent`
                    : 'text-slate-600 group-hover:text-slate-700'
                )}
                animate={{
                  scale: active ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {/* Active indicator line */}
              {active && (
                <motion.div
                  layoutId="mobile-indicator-line"
                  className={`absolute -bottom-1 w-8 h-1 bg-gradient-to-r ${tab.gradient} rounded-full`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                />
              )}

              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                whileTap={{
                  background: `radial-gradient(circle, ${tab.color === 'sky' ? 'rgba(56, 189, 248, 0.3)' : 
                    tab.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                    tab.color === 'emerald' ? 'rgba(52, 211, 153, 0.3)' :
                    'rgba(251, 146, 60, 0.3)'} 0%, transparent 70%)`
                }}
                transition={{ duration: 0.2 }}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom safe area for modern phones */}
      <div className="h-2 bg-gradient-to-t from-white/50 to-transparent"></div>
    </div>
  );
};

export default MobileNavigation;