import { Link } from 'react-router-dom'
import { MessageCircle, Compass, ShoppingBag, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface DesktopSidebarProps {
  currentTab: string
}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
    description: 'Chat with friends',
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
    description: 'Explore content',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
    description: 'Buy and sell',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    description: 'Your account',
  },
]

const DesktopSidebar = ({ currentTab }: DesktopSidebarProps) => {
  return (
    <div className="h-full flex flex-col p-4">
      <nav className="flex-1">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            
            return (
              <li key={tab.id}>
                <Link
                  to={tab.path}
                  className={clsx(
                    'flex items-center p-3 rounded-lg transition-colors relative group',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-tab-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r"
                      initial={false}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <Icon 
                    size={20} 
                    className={clsx(
                      'mr-3',
                      isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                    )} 
                  />
                  
                  <div className="flex-1">
                    <div className={clsx(
                      'font-medium',
                      isActive ? 'text-primary-900' : 'text-gray-900'
                    )}>
                      {tab.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {tab.description}
                    </div>
                  </div>
                  
                  {/* Notification Badge */}
                  {tab.id === 'messages' && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">3</span>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Social Marketplace v1.0</p>
          <p className="mt-1">© 2025 OpenHands</p>
        </div>
      </div>
    </div>
  )
}

export default DesktopSidebar