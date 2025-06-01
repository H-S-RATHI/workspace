import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

import { useAuthStore } from '../store/authStore'
import type { 
  LoginCredentials, 
  SignupData, 
  OTPVerificationData, 
  AuthResponse, 
  OTPResponse,
  RefreshTokenResponse,
  User 
} from '../types/auth'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { refreshAccessToken, logout } = useAuthStore.getState()
      
      try {
        const refreshed = await refreshAccessToken()
        
        if (refreshed) {
          const { accessToken } = useAuthStore.getState()
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } else {
          logout()
          return Promise.reject(error)
        }
      } catch (refreshError) {
        logout()
        return Promise.reject(error)
      }
    }
    
    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  sendOTP: async (credentials: LoginCredentials): Promise<OTPResponse> => {
    const response = await api.post('/auth/send-otp', credentials)
    return response.data
  },

  verifyOTP: async (data: OTPVerificationData): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-otp', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  enable2FA: async (method: 'SMS' | 'TOTP'): Promise<{ success: boolean; secret?: string; qrCode?: string }> => {
    const response = await api.post('/auth/2fa/enable', { method })
    return response.data
  },

  verify2FA: async (code: string): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/2fa/verify', { code })
    return response.data
  },

  disable2FA: async (): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/2fa/disable')
    return response.data
  },
}

// Users API
export const usersAPI = {
  getProfile: async (userId: string): Promise<{ success: boolean; user: User }> => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  uploadProfilePhoto: async (file: File): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  searchUsers: async (query: string): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  followUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/users/${userId}/follow`)
    return response.data
  },

  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/users/${userId}/follow`)
    return response.data
  },

  getFollowers: async (userId: string): Promise<{ success: boolean; followers: User[] }> => {
    const response = await api.get(`/users/${userId}/followers`)
    return response.data
  },

  getFollowing: async (userId: string): Promise<{ success: boolean; following: User[] }> => {
    const response = await api.get(`/users/${userId}/following`)
    return response.data
  },
}

// Chat API
export const chatAPI = {
  getConversations: async (): Promise<{ success: boolean; conversations: any[] }> => {
    const response = await api.get('/chat/conversations')
    return response.data
  },

  getConversation: async (conversationId: string): Promise<{ success: boolean; conversation: any }> => {
    const response = await api.get(`/chat/conversations/${conversationId}`)
    return response.data
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{ success: boolean; messages: any[] }> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`)
    return response.data
  },

  createConversation: async (data: any): Promise<{ success: boolean; conversation: any }> => {
    const response = await api.post('/chat/conversations', data)
    return response.data
  },

  uploadMedia: async (file: File, messageType: string): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData()
    formData.append('media', file)
    formData.append('messageType', messageType)
    
    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// Marketplace API
export const marketplaceAPI = {
  getProducts: async (filters?: any): Promise<{ success: boolean; products: any[]; total: number }> => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/marketplace/products?${params}`)
    return response.data
  },

  getProduct: async (productId: string): Promise<{ success: boolean; product: any }> => {
    const response = await api.get(`/marketplace/products/${productId}`)
    return response.data
  },

  createProduct: async (data: any): Promise<{ success: boolean; product: any }> => {
    const response = await api.post('/marketplace/products', data)
    return response.data
  },

  updateProduct: async (productId: string, data: any): Promise<{ success: boolean; product: any }> => {
    const response = await api.put(`/marketplace/products/${productId}`, data)
    return response.data
  },

  deleteProduct: async (productId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/marketplace/products/${productId}`)
    return response.data
  },

  uploadProductImages: async (files: File[]): Promise<{ success: boolean; urls: string[] }> => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    
    const response = await api.post('/marketplace/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  searchProducts: async (query: string, filters?: any): Promise<{ success: boolean; products: any[]; total: number }> => {
    const params = new URLSearchParams({ q: query, ...filters }).toString()
    const response = await api.get(`/marketplace/search?${params}`)
    return response.data
  },

  getDeals: async (): Promise<{ success: boolean; deals: any[] }> => {
    const response = await api.get('/marketplace/deals')
    return response.data
  },

  createOrder: async (data: any): Promise<{ success: boolean; order: any }> => {
    const response = await api.post('/marketplace/orders', data)
    return response.data
  },

  getOrders: async (): Promise<{ success: boolean; orders: any[] }> => {
    const response = await api.get('/marketplace/orders')
    return response.data
  },
}

// Discover API
export const discoverAPI = {
  getFeed: async (type = 'for_you', page = 1): Promise<{ success: boolean; posts: any[]; hasMore: boolean }> => {
    const response = await api.get(`/discover/feed?type=${type}&page=${page}`)
    return response.data
  },

  getReels: async (page = 1): Promise<{ success: boolean; reels: any[]; hasMore: boolean }> => {
    const response = await api.get(`/discover/reels?page=${page}`)
    return response.data
  },

  createPost: async (data: any): Promise<{ success: boolean; post: any }> => {
    const response = await api.post('/discover/posts', data)
    return response.data
  },

  createReel: async (data: any): Promise<{ success: boolean; reel: any }> => {
    const response = await api.post('/discover/reels', data)
    return response.data
  },

  likePost: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/discover/posts/${postId}/like`)
    return response.data
  },

  unlikePost: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/discover/posts/${postId}/like`)
    return response.data
  },

  commentOnPost: async (postId: string, comment: string): Promise<{ success: boolean; comment: any }> => {
    const response = await api.post(`/discover/posts/${postId}/comments`, { comment })
    return response.data
  },

  search: async (query: string, type = 'all'): Promise<{ success: boolean; results: any }> => {
    const response = await api.get(`/discover/search?q=${encodeURIComponent(query)}&type=${type}`)
    return response.data
  },
}

export default api