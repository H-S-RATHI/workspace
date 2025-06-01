import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'

// Placeholder components for sub-tabs
const FeedTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Feed</h2>
    
    {/* Toggle: Following vs For You */}
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm">
        For You
      </button>
      <button className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
        Following
      </button>
    </div>

    <div className="space-y-6">
      {/* Sample Post */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">SJ</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
              <p className="text-gray-500 text-sm">2 hours ago</p>
            </div>
          </div>
          
          <p className="text-gray-800 mb-3">
            Just discovered this amazing coffee shop downtown! ☕️ The atmosphere is perfect for working.
          </p>
          
          <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-3">
            <span className="text-gray-500">📷 Image placeholder</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500">
                <span>❤️</span>
                <span className="text-sm">24</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                <span>💬</span>
                <span className="text-sm">5</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500">
                <span>📤</span>
              </button>
            </div>
            <button className="text-gray-600 hover:text-gray-900">
              <span>🔖</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ReelsTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reels</h2>
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🎥</div>
            <p className="text-sm">Reel {i}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SearchTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Search</h2>
    
    {/* Search Bar */}
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search people, products, or videos..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </div>
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
        📷
      </button>
    </div>

    {/* Trending */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Trending</h3>
      <div className="flex flex-wrap gap-2">
        {['#summerfashion', '#techreview', '#foodie', '#travel'].map((tag) => (
          <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Recent Searches */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent</h3>
      <div className="space-y-2">
        {['iPhone 15', 'Coffee shops near me', 'John Doe'].map((search) => (
          <div key={search} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-700">{search}</span>
            <button className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const DiscoverPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('feed')

  const subTabs = [
    { id: 'feed', label: 'Feed', component: FeedTab },
    { id: 'reels', label: 'Reels', component: ReelsTab },
    { id: 'search', label: 'Search', component: SearchTab },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tabs Navigation */}
      <SubTabNavigation
        tabs={subTabs}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<FeedTab />} />
          <Route path="/feed" element={<FeedTab />} />
          <Route path="/reels" element={<ReelsTab />} />
          <Route path="/search" element={<SearchTab />} />
        </Routes>
      </div>
    </div>
  )
}

export default DiscoverPage