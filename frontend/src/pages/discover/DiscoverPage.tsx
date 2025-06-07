import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Plus, Filter, Grid, List, Search, TrendingUp } from 'lucide-react'
import { PostCard } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import CreatePostModal from '../../components/posts/CreatePostModal'
import { discoverService, type Post } from '../../services/discoverService'

// Feed Tab - Card-based infinite scroll
const FeedTab = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState<'for-you' | 'following'>('for-you')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [feedType])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = feedType === 'following' 
        ? await discoverService.getFollowingFeed()
        : await discoverService.getFeed()
      setPosts(response.posts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await discoverService.likePost(postId)
      setPosts(prev => prev.map(post => 
        post.postId === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = (postId: string) => {
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', postId)
  }

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId)
  }

  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev])
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    return 'now'
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header with Create Post Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Toggle: Following vs For You */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
          <button 
            onClick={() => setFeedType('for-you')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              feedType === 'for-you' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            For You
          </button>
          <button 
            onClick={() => setFeedType('following')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              feedType === 'following' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Following
          </button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.postId}
                avatar={post.profilePhotoUrl || '/api/placeholder/36/36'}
                name={post.fullName}
                username={post.username}
                media={post.mediaUrl}
                caption={post.content || ''}
                likes={post.likes}
                comments={post.comments}
                timestamp={formatTimestamp(post.createdAt)}
                isLiked={post.isLiked}
                onLike={() => handleLike(post.postId)}
                onComment={() => handleComment(post.postId)}
                onShare={() => handleShare(post.postId)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts to show</p>
              <p className="text-sm text-gray-400 mt-1">
                {feedType === 'following' ? 'Follow some users to see their posts here' : 'Check back later for new content'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

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

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    loadTrendingHashtags()
    loadRecentSearches()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    return 'now'
  }

  const loadTrendingHashtags = async () => {
    try {
      const response = await discoverService.getTrendingHashtags(8)
      setTrendingHashtags(response.hashtags?.map((h: any) => h.hashtag) || [])
    } catch (error) {
      console.error('Error loading trending hashtags:', error)
    }
  }

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 6)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      const response = await discoverService.search(query)
      setSearchResults(response)
      saveRecentSearch(query)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery)
    }
  }

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag)
    handleSearch(hashtag)
  }

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search)
    handleSearch(search)
  }

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-12 py-4 text-lg rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <button 
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              📷
            </button>
          </div>

          {/* Search Results */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {searchResults && !loading && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
              
              {/* Posts */}
              {searchResults.posts?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Posts</h4>
                  <div className="space-y-4">
                    {searchResults.posts.slice(0, 3).map((post: Post) => (
                      <PostCard
                        key={post.postId}
                        avatar={post.profilePhotoUrl || '/api/placeholder/36/36'}
                        name={post.fullName}
                        username={post.username}
                        media={post.mediaUrl}
                        caption={post.content || ''}
                        likes={post.likes}
                        comments={post.comments}
                        timestamp={formatTimestamp(post.createdAt)}
                        isLiked={post.isLiked}
                        onLike={() => {/* handle like */}}
                        onComment={() => {/* handle comment */}}
                        onShare={() => {/* handle share */}}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {searchResults.users?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">People</h4>
                  <div className="space-y-3">
                    {searchResults.users.slice(0, 5).map((user: any) => (
                      <div key={user.userId} className="bg-white rounded-lg p-4 flex items-center space-x-3">
                        <img 
                          src={user.profilePhotoUrl || '/api/placeholder/40/40'} 
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{user.fullName}</h5>
                          <p className="text-sm text-gray-500">@{user.username} • {user.followersCount} followers</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trending */}
          {!searchResults && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Now</h3>
              <div className="flex flex-wrap gap-3">
                {trendingHashtags.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => handleHashtagClick(tag)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!searchResults && recentSearches.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
              <div className="space-y-3">
                {recentSearches.map((search) => (
                  <div key={search} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div 
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <span className="text-gray-400">🕒</span>
                      <span className="text-gray-700 font-medium">{search}</span>
                    </div>
                    <button 
                      onClick={() => removeRecentSearch(search)}
                      className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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