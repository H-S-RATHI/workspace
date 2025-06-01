import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, Compass, ShoppingBag, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface MobileNavigationProps {
  currentTab: string
}

const tabs = [
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    path: '/messages',
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    path: '/discover',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    path: '/marketplace',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
  },
]

const MobileNavigation = ({ currentTab }: MobileNavigationProps) => {
  return (
    <div className="h-15 bg-white border-t border-gray-200 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = currentTab === tab.id
        
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={clsx(
              'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative',
              isActive
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute inset-0 bg-primary-50 rounded-lg"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              <Icon 
                size={20} 
                className={clsx(
                  'mb-1',
                  isActive ? 'fill-current' : ''
                )} 
              />
              <span className="text-xs font-medium">
                {tab.label}
              </span>
            </div>
            
            {/* Notification Badge */}
            {tab.id === 'messages' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default MobileNavigation