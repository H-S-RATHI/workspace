import { useState, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, MessageSquare, Video, Plus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/auth';

interface TopBarProps {
  user: User | null;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const TopBar = ({ user, onMenuToggle, isMobileMenuOpen = false }: TopBarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`sticky top-0 z-50 h-16 bg-white border-b border-gray-200 transition-shadow duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className="mr-3 p-2 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
              Social Marketplace
            </h1>
          </div>
        </div>

        {/* Center Section - Search Bar (hidden on mobile) */}
        <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search people, products, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section - Icons and User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Create New Button */}
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Plus size={22} />
          </button>
          
          {/* Messages */}
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <MessageSquare size={22} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </button>
          
          {/* Video Call */}
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Video size={22} />
          </button>
          
          {/* User Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-full focus:outline-none hover:ring-2 hover:ring-blue-100 transition-all"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <img
                src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=3b82f6&color=fff`}
                alt={user?.fullName || 'User'}
                className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-blue-200 transition-colors"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=3b82f6&color=fff`;
                }}
              />
              <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                {user?.fullName?.split(' ')[0] || 'Profile'}
              </span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">@{user?.username || 'username'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Add navigation to settings page
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Settings size={16} className="mr-2.5 text-gray-500" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-2.5" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;