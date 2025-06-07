import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle,
  Phone,
  Zap,
  Compass,
  Film,
  Search,
  ShoppingBag,
  Tag,
  Gift,
  User,
  Settings,
  BarChart2,
  Bell,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { getGradientClasses } from '../../styles/colors';

interface TopBarProps {
  currentTab: string;
  isMobile: boolean;
}

// Define sub-tabs for each main tab
const subTabsConfig = {
  messages: [
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/messages' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/messages/calls' },
    { id: 'status', label: 'Status', icon: Zap, path: '/messages/status' }
  ],
  discover: [
    { id: 'feed', label: 'Feed', icon: Compass, path: '/discover' },
    { id: 'reels', label: 'Reels', icon: Film, path: '/discover/reels' },
    { id: 'search', label: 'Search', icon: Search, path: '/discover/search' }
  ],
  marketplace: [
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/marketplace' },
    { id: 'sell', label: 'Sell', icon: Tag, path: '/marketplace/sell' },
    { id: 'deals', label: 'Deals', icon: Gift, path: '/marketplace/deals' }
  ],
  profile: [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/profile/settings' },
    { id: 'tools', label: 'Tools', icon: BarChart2, path: '/profile/tools' }
  ]
};

const TopBar = ({ currentTab, isMobile }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Get current sub-tabs based on active main tab
  const currentSubTabs = subTabsConfig[currentTab as keyof typeof subTabsConfig] || [];
  
  // Determine active sub-tab
  const getActiveSubTab = () => {
    const currentPath = location.pathname;
    const activeSubTab = currentSubTabs.find(tab => tab.path === currentPath);
    return activeSubTab?.id || currentSubTabs[0]?.id;
  };

  const activeSubTab = getActiveSubTab();
  const gradientClasses = getGradientClasses(currentTab);

  // Get enhanced tab colors based on current main tab
  const getTabColors = () => {
    switch (currentTab) {
      case 'messages':
        return {
          gradient: 'from-sky-400 via-blue-500 to-indigo-600',
          activeText: 'text-sky-600',
          activeBg: 'bg-gradient-to-r from-sky-50 to-blue-50',
          activeIndicator: 'bg-gradient-to-r from-sky-400 to-blue-500',
          glowColor: 'shadow-sky-200/50'
        };
      case 'discover':
        return {
          gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
          activeText: 'text-purple-600',
          activeBg: 'bg-gradient-to-r from-violet-50 to-purple-50',
          activeIndicator: 'bg-gradient-to-r from-violet-500 to-purple-500',
          glowColor: 'shadow-purple-200/50'
        };
      case 'marketplace':
        return {
          gradient: 'from-emerald-400 via-teal-500 to-green-600',
          activeText: 'text-emerald-600',
          activeBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          activeIndicator: 'bg-gradient-to-r from-emerald-400 to-teal-500',
          glowColor: 'shadow-emerald-200/50'
        };
      case 'profile':
        return {
          gradient: 'from-amber-400 via-orange-500 to-red-500',
          activeText: 'text-orange-600',
          activeBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          activeIndicator: 'bg-gradient-to-r from-amber-400 to-orange-500',
          glowColor: 'shadow-orange-200/50'
        };
      default:
        return {
          gradient: 'from-slate-600 to-slate-700',
          activeText: 'text-slate-600',
          activeBg: 'bg-slate-50',
          activeIndicator: 'bg-slate-600',
          glowColor: 'shadow-slate-200/50'
        };
    }
  };

  const colors = getTabColors();

  if (isMobile) {
    return (
      <div className="relative">
        {/* Mobile Sub-tabs with modern design */}
        <div className="flex px-4 py-3">
          {currentSubTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex-1 relative"
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <div className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? `${colors.activeBg} ${colors.glowColor} shadow-lg` 
                    : 'hover:bg-slate-50'
                }`}>
                  {/* Icon with enhanced styling */}
                  <div className={`p-2.5 rounded-xl mb-2 transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.glowColor}` 
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}>
                    <Icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-slate-600'
                      }`} 
                    />
                  </div>
                  
                  {/* Label with gradient text for active state */}
                  <span className={`text-xs font-semibold transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`
                      : 'text-slate-600'
                  }`}>
                    {tab.label}
                  </span>
                </div>

                {/* Active indicator with modern design */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-sub-indicator"
                    style={{ left: '37%' }}
                    className={`absolute -bottom-1 transform -translate-x-1/2 w-12 h-1 ${colors.activeIndicator} rounded-full`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Layout - Completely Redesigned
 // Desktop layout
 return (
  <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
    <div className="flex items-center justify-center max-w-4xl mx-auto">
      <div className="flex space-x-1 bg-gray-50 rounded-xl p-1">
        {currentSubTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="desktop-tab-indicator"
                  className="absolute -bottom-1 left-1/2 w-4 h-0.5 -translate-x-1/2 bg-white rounded-full"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);
};


export default TopBar;