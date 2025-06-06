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
  BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Get current sub-tabs based on active main tab
  const currentSubTabs = subTabsConfig[currentTab as keyof typeof subTabsConfig] || [];
  
  // Determine active sub-tab
  const getActiveSubTab = () => {
    const currentPath = location.pathname;
    const activeSubTab = currentSubTabs.find(tab => tab.path === currentPath);
    return activeSubTab?.id || currentSubTabs[0]?.id;
  };

  const activeSubTab = getActiveSubTab();

  // Get tab colors based on current main tab
  const getTabColors = () => {
    switch (currentTab) {
      case 'messages':
        return {
          gradient: 'from-blue-600 to-indigo-600',
          activeText: 'text-blue-600',
          activeBg: 'bg-blue-50',
          activeIndicator: 'bg-blue-600'
        };
      case 'discover':
        return {
          gradient: 'from-purple-600 to-pink-600',
          activeText: 'text-purple-600',
          activeBg: 'bg-purple-50',
          activeIndicator: 'bg-purple-600'
        };
      case 'marketplace':
        return {
          gradient: 'from-green-600 to-emerald-600',
          activeText: 'text-green-600',
          activeBg: 'bg-green-50',
          activeIndicator: 'bg-green-600'
        };
      case 'profile':
        return {
          gradient: 'from-orange-600 to-red-600',
          activeText: 'text-orange-600',
          activeBg: 'bg-orange-50',
          activeIndicator: 'bg-orange-600'
        };
      default:
        return {
          gradient: 'from-gray-600 to-gray-700',
          activeText: 'text-gray-600',
          activeBg: 'bg-gray-50',
          activeIndicator: 'bg-gray-600'
        };
    }
  };

  const colors = getTabColors();

  if (isMobile) {
    return (
      <div className="bg-white shadow-sm">
        {/* Mobile Sub-tabs */}
        <div className="flex bg-white">
          {currentSubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center py-4 px-3 relative transition-all duration-200 ${
                  isActive 
                    ? `${colors.activeText}` 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 transition-all duration-200 ${
                  isActive ? colors.activeBg : 'hover:bg-gray-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    key={`mobile-indicator-${tab.id}`}
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 ${colors.activeIndicator} rounded-t-full`}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      x: '-50%',
                      width: '2rem'
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Clean Sub-tabs Only */}
      <div className="px-6 py-4">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {currentSubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative flex-1 justify-center ${
                  isActive 
                    ? `bg-white ${colors.activeText} shadow-sm` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    key={`desktop-indicator-${tab.id}`}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      width: '100%'
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    style={{ zIndex: -1 }}
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