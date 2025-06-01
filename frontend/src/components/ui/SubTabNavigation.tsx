import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface SubTab {
  id: string
  label: string
  component?: React.ComponentType
}

interface SubTabNavigationProps {
  tabs: SubTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const SubTabNavigation = ({ tabs, activeTab, onTabChange }: SubTabNavigationProps) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex-1 py-3 px-4 text-sm font-medium text-center relative transition-colors',
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="sub-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SubTabNavigation