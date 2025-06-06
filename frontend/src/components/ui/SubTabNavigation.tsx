import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'

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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      })
    }
  }, [activeTab])

  // Set initial position
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      })
    }
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 relative" ref={containerRef}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex-1 py-3 px-4 text-sm font-medium text-center relative transition-colors',
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <motion.div
        className="absolute bottom-0 h-0.5 bg-primary-600"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
      />
    </div>
  )
}

export default SubTabNavigation