import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

import MobileNavigation from '../ui/MobileNavigation'
import DesktopSidebar from '../ui/DesktopSidebar'
import TopBar from '../ui/TopBar'
import { useAuthStore } from '../../store/authStore'

const MainLayout = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get current tab from location
  const getCurrentTab = () => {
    const path = location.pathname.split('/')[1]
    return path || 'messages'
  }

  const currentTab = getCurrentTab()

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Status Bar Safe Area */}
        <div className="safe-top bg-white" />
        
        {/* Sub-tabs Bar (contextual to active main tab) */}
        <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4">
          {/* Sub-tabs will be rendered by individual pages */}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        
        {/* Main Tabs Bar */}
        <MobileNavigation currentTab={currentTab} />
        
        {/* Bottom Safe Area */}
        <div className="safe-bottom bg-white" />
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Layout */}
      
      {/* Top Global Bar */}
      <div className="fixed top-0 left-0 right-0 h-15 bg-white border-b border-gray-200 z-50">
        <TopBar user={user} />
      </div>
      
      {/* Left Sidebar */}
      <div className="fixed left-0 top-15 bottom-0 w-50 bg-white border-r border-gray-200 z-40">
        <DesktopSidebar currentTab={currentTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-50 mt-15">
        <div className="flex h-full">
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          
          {/* Right Panel (Chat/Context) */}
          <div className="w-75 bg-white border-l border-gray-200 hidden xl:block">
            {/* Right panel content will be contextual */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity
              </h3>
              <p className="text-gray-500 text-sm">
                Recent activity will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout