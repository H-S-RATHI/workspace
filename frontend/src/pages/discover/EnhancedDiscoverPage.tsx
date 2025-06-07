import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Filter, Grid, List, Search, TrendingUp } from 'lucide-react';
import EnhancedPostCard from '../../components/posts/EnhancedPostCard';
import CreatePostModal from '../../components/posts/CreatePostModal';
import Input from '../../components/ui/Input';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Post {
  postId: string;
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl?: string;
  postType: 'TEXT' | 'PHOTO' | 'VIDEO' | 'CAROUSEL';
  caption?: string;
  mediaUrls: string[];
  hashtags: string[];
  location?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  createdAt: string;
}

interface Category {
  categoryId: string;
  name: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  color?: string;
}

interface Reel {
  reelId: string;
  userId: string;
  username: string;
  fullName: string;
  profilePhotoUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  hashtags: string[];
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  createdAt: string;
}

const FeedTab = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<'for-you' | 'following'>('for-you');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [feedType, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/v1/discover/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/discover/feed';
      const params = new URLSearchParams();
      
      if (feedType === 'following') {
        params.append('type', 'following');
      }
      
      if (selectedCategory) {
        url = `/api/v1/discover/categories/${selectedCategory}/posts`;
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    setPosts(prev => prev.map(post => 
      post.postId === postId 
        ? { 
            ...post, 
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1
          }
        : post
    ));
  };

  const handleSave = (postId: string, isSaved: boolean) => {
    setPosts(prev => prev.map(post => 
      post.postId === postId ? { ...post, isSaved } : post
    ));
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Feed Type Toggle */}
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

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Categories</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.categoryId}
                  onClick={() => setSelectedCategory(category.categoryId)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.categoryId
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.categoryId 
                      ? category.color || '#2563eb'
                      : undefined
                  }}
                >
                  {category.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <EnhancedPostCard
                key={post.postId}
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No posts to show</p>
              <p className="text-sm text-gray-400 mt-1">
                {feedType === 'following' 
                  ? 'Follow some users to see their posts here' 
                  : selectedCategory 
                    ? 'No posts in this category yet'
                    : 'Check back later for new content'
                }
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
  );
};

const ReelsTab = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/discover/reels');
      setReels(response.data.reels || []);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reels</h2>
            <p className="text-gray-600">Discover trending short videos</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading reels...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {reels.map((reel) => (
                <div 
                  key={reel.reelId}
                  className="aspect-[9/16] bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 relative overflow-hidden shadow-md group"
                >
                  {reel.thumbnailUrl ? (
                    <img
                      src={reel.thumbnailUrl}
                      alt="Reel thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Reel info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={reel.profilePhotoUrl || '/api/placeholder/24/24'}
                        alt={reel.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{reel.username}</span>
                    </div>
                    {reel.caption && (
                      <p className="text-sm line-clamp-2">{reel.caption}</p>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="absolute top-4 right-4 text-white text-xs space-y-1">
                    <div className="bg-black/50 px-2 py-1 rounded-full">
                      {reel.viewsCount}K views
                    </div>
                    <div className="bg-black/50 px-2 py-1 rounded-full">
                      {Math.floor(reel.duration)}s
                    </div>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadTrendingHashtags();
    loadRecentSearches();
  }, []);

  const loadTrendingHashtags = async () => {
    try {
      const response = await api.get('/api/v1/discover/trending/hashtags?limit=8');
      setTrendingHashtags(response.data.hashtags?.map((h: any) => h.hashtag) || []);
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
    }
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/v1/discover/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag);
    handleSearch(hashtag);
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

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
              <Search className="w-5 h-5" />
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
                      <EnhancedPostCard
                        key={post.postId}
                        post={post}
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
                          <p className="text-sm text-gray-500">@{user.username}</p>
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
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Trending Now</h3>
              </div>
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
  );
};

const EnhancedDiscoverPage = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which component to render based on the current path
  if (currentPath === '/discover/reels') {
    return <ReelsTab />;
  } else if (currentPath === '/discover/search') {
    return <SearchTab />;
  } else {
    return <FeedTab />;
  }
};

export default EnhancedDiscoverPage;