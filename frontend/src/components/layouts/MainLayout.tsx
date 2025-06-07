import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import MobileNavigation from '../ui/MobileNavigation';
import DesktopSidebar from '../ui/DesktopSidebar';
import TopBar from '../ui/TopBar';
import { useAuthStore } from '../../store/authStore';
import { useCall } from '../../pages/messages/calls/hooks/useCall';
import { getSectionColors, getGradientClasses } from '../../styles/colors';
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
  const gradientClasses = getGradientClasses(currentTab);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Status Bar Simulation */}
        <div className="h-6 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-4 text-white text-xs font-medium">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>

        {/* Sub-tabs Bar - Modern Design */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <TopBar currentTab={currentTab} isMobile={true} />
        </div>

        {/* Content Area - Enhanced with modern background */}
        <div className={`flex-1 overflow-hidden bg-gradient-to-br ${gradientClasses.lightGradient} relative`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>
          <div className="relative z-10 h-full">
            <Outlet />
          </div>
        </div>

        {/* Main Tabs Bar - Modern Floating Design */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-t from-white via-white to-white/95">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50">
            <MobileNavigation />
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout - Completely Redesigned
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>

      {/* Left Sidebar - Modern Glass Design */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 relative z-20"
      >
        <div className="h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl shadow-slate-200/20">
          <DesktopSidebar 
            collapsed={sidebarCollapsed} 
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentTab={currentTab}
          />
        </div>
      </motion.div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Global Bar - Modern Design */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <TopBar currentTab={currentTab} isMobile={false} />
        </div>
        
        {/* Content Area with Enhanced Background */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className={`flex-1 overflow-hidden bg-gradient-to-br ${gradientClasses.lightGradient} relative`}>
            {/* Subtle animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[length:32px_32px] animate-pulse-slow"></div>
            </div>
            <div className="relative z-10 h-full">
              <Outlet />
            </div>
          </div>

          {/* Right Panel - Chat/Notifications (Optional) */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: currentTab === 'messages' ? 320 : 0,
              opacity: currentTab === 'messages' ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white/80 backdrop-blur-xl border-l border-slate-200/50 shadow-xl shadow-slate-200/20 overflow-hidden"
          >
            {currentTab === 'messages' && (
              <div className="h-full p-6">
                <div className="text-sm font-medium text-slate-600 mb-4">Quick Chat</div>
                <div className="space-y-3">
                  {/* Quick chat items would go here */}
                  <div className="text-xs text-slate-400 text-center py-8">
                    Chat panel coming soon...
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Call Dialog - Enhanced */}
      <CallDialog
        isOpen={!!activeCall && isCallModalOpen}
        onClose={() => {
          if (activeCall) {
            endCall(activeCall.callId);
          }
        }}
        onCallStart={(type) => {
          console.log('Starting call of type:', type);
        }}
        recipientName={activeCall?.otherParty?.fullName || 'Unknown User'}
        recipientAvatar={activeCall?.otherParty?.profilePhotoUrl}
        callType={activeCall?.callType}
      />

      {/* Floating Action Button (Desktop) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button className={`w-14 h-14 bg-gradient-to-r ${gradientClasses.gradient} rounded-full shadow-xl shadow-slate-300/50 flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 group`}>
          <svg className="w-6 h-6 group-hover:rotate-45 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default MainLayout;