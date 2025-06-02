import { apiClient } from './api'

export interface Post {
  postId: string
  userId: string
  username: string
  fullName: string
  profilePhotoUrl?: string
  content?: string
  mediaUrl?: string
  mediaType?: 'IMAGE' | 'VIDEO'
  hashtags?: string[]
  mentions?: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  isLiked?: boolean
}

export interface Reel {
  reelId: string
  userId: string
  username: string
  fullName: string
  profilePhotoUrl?: string
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  description?: string
  hashtags?: string[]
  mentions?: string[]
  duration: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  views: number
  isLiked?: boolean
}

export interface Comment {
  commentId: string
  content: string
  createdAt: string
  userId: string
  username: string
  fullName: string
  profilePhotoUrl?: string
  replyCount: number
}

export interface SearchResult {
  posts: Post[]
  reels: Reel[]
  users: Array<{
    userId: string
    username: string
    fullName: string
    profilePhotoUrl?: string
    followersCount: number
  }>
  products: Array<{
    productId: string
    title: string
    price: number
    imageUrl?: string
    sellerId: string
    sellerUsername: string
  }>
}

class DiscoverService {
  // Posts
  async getPosts(page = 1, limit = 20) {
    const response = await apiClient.get('/discover/posts', {
      params: { page, limit }
    })
    return response.data
  }

  async likePost(postId: string) {
    const response = await apiClient.post(`/discover/posts/${postId}/like`)
    return response.data
  }

  async getPostComments(postId: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/discover/posts/${postId}/comments`, {
      params: { page, limit }
    })
    return response.data
  }

  async addPostComment(postId: string, content: string, parentCommentId?: string) {
    const response = await apiClient.post(`/discover/posts/${postId}/comments`, {
      content,
      parentCommentId
    })
    return response.data
  }

  async createPost(data: {
    content?: string
    mediaUrl?: string
    mediaType?: 'IMAGE' | 'VIDEO'
    hashtags?: string[]
    mentions?: string[]
  }) {
    const response = await apiClient.post('/discover/posts', data)
    return response.data
  }

  // Reels
  async getReels(page = 1, limit = 20) {
    const response = await apiClient.get('/discover/reels', {
      params: { page, limit }
    })
    return response.data
  }

  async likeReel(reelId: string) {
    const response = await apiClient.post(`/discover/reels/${reelId}/like`)
    return response.data
  }

  async getReelComments(reelId: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/discover/reels/${reelId}/comments`, {
      params: { page, limit }
    })
    return response.data
  }

  async addReelComment(reelId: string, content: string, parentCommentId?: string) {
    const response = await apiClient.post(`/discover/reels/${reelId}/comments`, {
      content,
      parentCommentId
    })
    return response.data
  }

  async recordReelView(reelId: string) {
    const response = await apiClient.post(`/discover/reels/${reelId}/view`)
    return response.data
  }

  async createReel(data: {
    videoUrl: string
    thumbnailUrl?: string
    title?: string
    description?: string
    hashtags?: string[]
    mentions?: string[]
    duration: number
  }) {
    const response = await apiClient.post('/discover/reels', data)
    return response.data
  }

  // Search
  async search(query: string, type?: 'posts' | 'reels' | 'users' | 'products', page = 1, limit = 20) {
    const response = await apiClient.get('/discover/search', {
      params: { q: query, type, page, limit }
    })
    return response.data
  }

  async getTrendingHashtags(limit = 20) {
    const response = await apiClient.get('/discover/trending/hashtags', {
      params: { limit }
    })
    return response.data
  }

  // Feed
  async getFeed(page = 1, limit = 20) {
    const response = await apiClient.get('/discover/feed', {
      params: { page, limit }
    })
    return response.data
  }

  async getFollowingFeed(page = 1, limit = 20) {
    const response = await apiClient.get('/discover/feed/following', {
      params: { page, limit }
    })
    return response.data
  }
}

export const discoverService = new DiscoverService()