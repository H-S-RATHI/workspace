import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Video, 
  Plus, 
  Menu,
  MessageCircle,
  Phone,
  Zap,
  Compass,
  Film,
  ShoppingBag,
  Tag,
  Gift,
  User,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/auth/login');
  };

  // Get current sub-tabs based on active main tab
  const currentSubTabs = subTabsConfig[currentTab as keyof typeof subTabsConfig] || [];
  
  // Determine active sub-tab
  const getActiveSubTab = () => {
    const currentPath = location.pathname;
    const activeSubTab = currentSubTabs.find(tab => tab.path === currentPath);
    return activeSubTab?.id || currentSubTabs[0]?.id;
  };

  const activeSubTab = getActiveSubTab();

  if (isMobile) {
    return (
      <div className="bg-white border-b border-gray-200">
        {/* Mobile Header */}
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{currentTab}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-tabs */}
        <div className="flex bg-gray-50">
          {currentSubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center py-3 px-2 relative transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="mobile-subtab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
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
    <div className="h-16 bg-white border-b border-gray-200 flex flex-col">
      {/* Main Top Bar */}
      <div className="h-10 flex items-center justify-between px-6 border-b border-gray-100">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          
          <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </button>
          
          {/* User Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-full focus:outline-none hover:ring-2 hover:ring-blue-100 transition-all"
            >
              <img
                src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=3b82f6&color=fff`}
                alt={user?.fullName || 'User'}
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=3b82f6&color=fff`;
                }}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">@{user?.username || 'username'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="h-6 flex items-center px-6 bg-gray-50">
        <div className="flex space-x-6">
          {currentSubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors relative ${
                  isActive 
                    ? 'text-blue-600 bg-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;