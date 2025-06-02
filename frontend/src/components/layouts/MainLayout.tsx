import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import MobileNavigation from '../ui/MobileNavigation';
import DesktopSidebar from '../ui/DesktopSidebar';
import TopBar from '../ui/TopBar';
import { useAuthStore } from '../../store/authStore';

const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024; // Using 1024px as the breakpoint for desktop
    setIsMobile(mobile);
    
    // Close mobile menu when resizing to desktop
    if (!mobile) {
      setIsMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Get current tab from location
  const getCurrentTab = useCallback(() => {
    const path = location.pathname.split('/')[1];
    return path || 'messages';
  }, [location.pathname]);

  const currentTab = getCurrentTab();
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Top Bar with Menu Toggle */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="h-16 flex items-center px-4">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <span className="text-2xl">×</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
            </h1>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleMobileMenu}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-lg"
              >
                <DesktopSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <MobileNavigation />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Global Bar */}
      <TopBar user={user} />
      
      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Fixed */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
            <DesktopSidebar />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </div>
        
        {/* Right Panel (Chat/Context) - Hidden on smaller screens */}
        <div className="hidden xl:block xl:flex-shrink-0 w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Sample activity item {item}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item} hour{item !== 1 ? 's' : ''} ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;