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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
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

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Top Bar with Sub-tabs */}
        <TopBar currentTab={currentTab} isMobile={true} />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <MobileNavigation />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Sub-tabs */}
        <TopBar currentTab={currentTab} isMobile={false} />
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;