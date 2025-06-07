import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import MobileNavigation from '../ui/MobileNavigation';
import DesktopSidebar from '../ui/DesktopSidebar';
import TopBar from '../ui/TopBar';
import { useAuthStore } from '../../store/authStore';
import { useCall } from '../../pages/messages/calls/hooks/useCall';
import { colors, getSectionColors } from '../../styles/colors';
import { CallDialog } from '../../pages/messages/calls/components/CallDialog';

const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { activeCall, isCallModalOpen, endCall } = useCall();
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
  const sectionColors = getSectionColors(currentTab);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Top Bar with Sub-tabs - Optimized height for mobile */}
        <div className="flex-shrink-0">
          <TopBar currentTab={currentTab} isMobile={true} />
        </div>

        {/* Content Area - Maximized for mobile */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <Outlet />
        </div>

        {/* Bottom Navigation - Compact for mobile */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 relative z-10">
          <MobileNavigation />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Sidebar with dynamic theming */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-shrink-0 bg-white border-r border-gray-200 shadow-sm"
      >
        <DesktopSidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentTab={currentTab}
        />
      </motion.div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Sub-tabs */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <TopBar currentTab={currentTab} isMobile={false} />
        </div>
        
        {/* Content with section-specific background */}
        <div 
          className="flex-1 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${sectionColors[50]} 0%, ${sectionColors[100]} 100%)`
          }}
        >
          <Outlet />
        </div>
      </div>

      {/* Call Dialog */}
      <CallDialog
        isOpen={!!activeCall && isCallModalOpen}
        onClose={() => {
          if (activeCall) {
            endCall(activeCall.callId);
          }
        }}
        onCallStart={(type) => {
          // Handle call start if needed
          console.log('Starting call of type:', type);
        }}
        recipientName={activeCall?.otherParty?.fullName || 'Unknown User'}
        recipientAvatar={activeCall?.otherParty?.profilePhotoUrl}
        callType={activeCall?.callType}
      />
    </div>
  );
};

export default MainLayout;