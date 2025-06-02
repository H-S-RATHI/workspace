import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Video,
  Zap,
  Compass, 
  Film,
  Search,
  ShoppingBag, 
  Tag,
  User,
  Settings,
  BarChart2,
  LogOut,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

interface DesktopSidebarProps {}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    description: 'Chat, calls & stories',
    subItems: [
      { label: 'Chat', icon: MessageCircle, path: '/messages/chat' },
      { label: 'Calls', icon: Video, path: '/messages/calls' },
      { label: 'Status', icon: Zap, path: '/messages/status' }
    ]
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    description: 'Explore content',
    subItems: [
      { label: 'Feed', icon: Compass, path: '/discover/feed' },
      { label: 'Reels', icon: Film, path: '/discover/reels' },
      { label: 'Search', icon: Search, path: '/discover/search' }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    description: 'Shop & sell',
    subItems: [
      { label: 'Shop', icon: ShoppingBag, path: '/marketplace/shop' },
      { label: 'Sell', icon: Tag, path: '/marketplace/sell' },
      { label: 'Deals', icon: Gift, path: '/marketplace/deals' }
    ]
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    description: 'Account & settings',
    subItems: [
      { label: 'Profile', icon: User, path: '/profile' },
      { label: 'Settings', icon: Settings, path: '/profile/settings' },
      { label: 'Analytics', icon: BarChart2, path: '/profile/analytics' }
    ]
  },
];

const DesktopSidebar = ({}: DesktopSidebarProps) => {
  const { handleLogout } = useAuthStore();
  const location = useLocation();
  
  const isTabActive = (path: string) => location.pathname.startsWith(path);
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  const toggleTab = (tabId: string) => {
    setExpandedTabs((prev: Record<string, boolean>) => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  // Auto-expand the current tab
  useEffect(() => {
    const currentTab = tabs.find(tab => isTabActive(tab.path));
    if (currentTab && !expandedTabs[currentTab.id]) {
      setExpandedTabs((prev: Record<string, boolean>) => ({
        ...prev,
        [currentTab.id]: true
      }));
    }
  }, [location.pathname]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 w-64">
      {/* Logo/Brand */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SocialApp
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.path);
            const isExpanded = expandedTabs[tab.id] || false;
            
            return (
              <li key={tab.id} className="space-y-1">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between group">
                    <Link
                      to={tab.path}
                      className={clsx(
                        'flex-1 flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon 
                        className={clsx(
                          'w-5 h-5 mr-3',
                          active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        )} 
                      />
                      <span>{tab.label}</span>
                    </Link>
                    {tab.subItems && tab.subItems.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleTab(tab.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ▼
                        </motion.span>
                      </button>
                    )}
                  </div>
                  
                  {/* Sub-items */}
                  {tab.subItems && tab.subItems.length > 0 && (
                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-8"
                    >
                      <ul className="py-1 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubItemActive = location.pathname === subItem.path;
                          
                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={clsx(
                                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                  isSubItemActive 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                              >
                                <SubIcon className="w-4 h-4 mr-2" />
                                <span>{subItem.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default DesktopSidebar