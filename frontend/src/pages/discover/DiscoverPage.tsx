import { useLocation } from 'react-router-dom'
import { PostCard } from '../../components/ui/Card'
import Input from '../../components/ui/Input'

// Feed Tab - Card-based infinite scroll
const FeedTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="max-w-2xl mx-auto p-6">
      {/* Toggle: Following vs For You */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
        <button className="flex-1 py-3 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm">
          For You
        </button>
        <button className="flex-1 py-3 px-4 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
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
          },
          {
            avatar: '/api/placeholder/36/36',
            name: 'Alex Thompson',
            username: 'alexthompson',
            media: '/api/placeholder/400/300',
            caption: 'Weekend hiking adventure in the mountains! 🏔️ Nature never fails to amaze me.',
            likes: 67,
            comments: 8,
            timestamp: '8h'
          }
        ].map((post, index) => (
          <PostCard key={index} {...post} />
        ))}
      </div>
    </div>
  </div>
)

const ReelsTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reels</h2>
          <p className="text-gray-600">Discover trending short videos</p>
        </div>
        
        {/* 3-column grid for thumbnails on mobile, 4-column on desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
            <div 
              key={i} 
              className="aspect-[9/16] bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 relative overflow-hidden shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="text-center text-white relative z-10">
                <div className="text-2xl mb-2">🎥</div>
                <p className="text-xs font-medium">Reel {i}</p>
              </div>
              {/* View count overlay */}
              <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                {Math.floor(Math.random() * 100)}K
              </div>
              {/* Duration overlay */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                0:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const SearchTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search</h2>
          <p className="text-gray-600">Find people, content, and products</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search people, products, or videos..."
            className="pl-12 pr-12 py-4 text-lg rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
            📷
          </button>
        </div>

        {/* Trending */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Now</h3>
          <div className="flex flex-wrap gap-3">
            {['#summerfashion', '#techreview', '#foodie', '#travel', '#fitness', '#art', '#music', '#gaming'].map((tag) => (
              <button 
                key={tag} 
                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
          <div className="space-y-3">
            {['iPhone 15', 'Coffee shops near me', 'John Doe', 'Summer dresses', 'Photography tips', 'React tutorials'].map((search) => (
              <div key={search} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">🕒</span>
                  <span className="text-gray-700 font-medium">{search}</span>
                </div>
                <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const DiscoverPage = () => {
  const location = useLocation()
  const currentPath = location.pathname

  // Determine which component to render based on the current path
  if (currentPath === '/discover/reels') {
    return <ReelsTab />
  } else if (currentPath === '/discover/search') {
    return <SearchTab />
  } else {
    return <FeedTab />
  }
}

export default DiscoverPage