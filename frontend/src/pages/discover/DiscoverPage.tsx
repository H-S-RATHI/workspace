import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'
import { PostCard } from '../../components/ui/Card'
import Input from '../../components/ui/Input'

// Feed Tab - Card-based infinite scroll
const FeedTab = () => (
  <div className="max-w-2xl mx-auto p-4 lg:p-6">
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
      {/* Sample Posts using PostCard component */}
      {[
        {
          avatar: '/api/placeholder/36/36',
          name: 'Sarah Johnson',
          username: 'sarahj',
          media: '/api/placeholder/400/320',
          caption: 'Just discovered this amazing coffee shop downtown! ☕️ The atmosphere is perfect for working.',
          likes: 24,
          comments: 5,
          timestamp: '2h'
        },
        {
          avatar: '/api/placeholder/36/36',
          name: 'Mike Chen',
          username: 'mikec',
          media: '/api/placeholder/400/400',
          caption: 'Beautiful sunset from my balcony tonight 🌅 #photography #sunset',
          likes: 89,
          comments: 12,
          timestamp: '4h'
        },
        {
          avatar: '/api/placeholder/36/36',
          name: 'Emma Wilson',
          username: 'emmaw',
          caption: 'Excited to announce my new project launch! 🚀 Thanks to everyone who supported me.',
          likes: 156,
          comments: 23,
          timestamp: '6h'
        }
      ].map((post, index) => (
        <PostCard key={index} {...post} />
      ))}
    </div>
  </div>
)

const ReelsTab = () => (
  <div className="p-4 lg:p-6">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Reels</h2>
    
    {/* 3-column grid for thumbnails (108px) on mobile, 4-column on desktop (200px) */}
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div 
          key={i} 
          className="aspect-[9/16] bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="text-center text-white relative z-10">
            <div className="text-2xl mb-2">🎥</div>
            <p className="text-xs lg:text-sm font-medium">Reel {i}</p>
          </div>
          {/* View count overlay */}
          <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
            {Math.floor(Math.random() * 100)}K views
          </div>
          {/* Duration overlay */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
            0:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SearchTab = () => (
  <div className="p-4 lg:p-6 max-w-2xl mx-auto">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Search</h2>
    
    {/* Search Bar */}
    <div className="relative mb-6">
      <Input
        type="text"
        placeholder="Search people, products, or videos..."
        className="pl-10 pr-12"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </div>
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
        📷
      </button>
    </div>

    {/* Trending */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Trending</h3>
      <div className="flex flex-wrap gap-2">
        {['#summerfashion', '#techreview', '#foodie', '#travel', '#fitness', '#art'].map((tag) => (
          <button 
            key={tag} 
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>

    {/* Recent Searches */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent</h3>
      <div className="space-y-2">
        {['iPhone 15', 'Coffee shops near me', 'John Doe', 'Summer dresses', 'Photography tips'].map((search) => (
          <div key={search} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">🕒</span>
              <span className="text-gray-700">{search}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1">✕</button>
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