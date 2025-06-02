import { apiClient } from './api'

export interface Product {
  productId: string
  sellerId: string
  sellerUsername: string
  sellerFullName: string
  sellerProfilePhotoUrl?: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  imageUrls: string[]
  tags?: string[]
  location?: string
  latitude?: number
  longitude?: number
  isAvailable: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  viewCount: number
  favoriteCount: number
  isFavorited?: boolean
}

export interface Deal {
  dealId: string
  productId: string
  dealType: 'FLASH_SALE' | 'GROUP_BUY' | 'LOCAL_DEAL'
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  startDate: string
  endDate: string
  maxParticipants?: number
  currentParticipants?: number
  isActive: boolean
  product: Product
}

export interface ProductSearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  location?: string
  radius?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular'
}

class MarketplaceService {
  // Products
  async getProducts(page = 1, limit = 20, filters?: ProductSearchFilters) {
    const response = await apiClient.get('/marketplace/products', {
      params: { page, limit, ...filters }
    })
    return response.data
  }

  async getProduct(productId: string) {
    const response = await apiClient.get(`/marketplace/products/${productId}`)
    return response.data
  }

  async createProduct(data: {
    title: string
    description: string
    price: number
    currency?: string
    category: string
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
    imageUrls: string[]
    tags?: string[]
    location?: string
    latitude?: number
    longitude?: number
  }) {
    const response = await apiClient.post('/marketplace/products', data)
    return response.data
  }

  async updateProduct(productId: string, data: Partial<{
    title: string
    description: string
    price: number
    category: string
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
    imageUrls: string[]
    tags: string[]
    location: string
    latitude: number
    longitude: number
    isAvailable: boolean
  }>) {
    const response = await apiClient.put(`/marketplace/products/${productId}`, data)
    return response.data
  }

  async deleteProduct(productId: string) {
    const response = await apiClient.delete(`/marketplace/products/${productId}`)
    return response.data
  }

  async favoriteProduct(productId: string) {
    const response = await apiClient.post(`/marketplace/products/${productId}/favorite`)
    return response.data
  }

  async recordProductView(productId: string) {
    const response = await apiClient.post(`/marketplace/products/${productId}/view`)
    return response.data
  }

  // User's products
  async getMyProducts(page = 1, limit = 20) {
    const response = await apiClient.get('/marketplace/my-products', {
      params: { page, limit }
    })
    return response.data
  }

  async getFavoriteProducts(page = 1, limit = 20) {
    const response = await apiClient.get('/marketplace/favorites', {
      params: { page, limit }
    })
    return response.data
  }

  // Search
  async searchProducts(query: string, page = 1, limit = 20, filters?: ProductSearchFilters) {
    const response = await apiClient.get('/marketplace/search', {
      params: { q: query, page, limit, ...filters }
    })
    return response.data
  }

  // Categories
  async getCategories() {
    const response = await apiClient.get('/marketplace/categories')
    return response.data
  }

  async getProductsByCategory(category: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/marketplace/categories/${category}/products`, {
      params: { page, limit }
    })
    return response.data
  }

  // Deals
  async getDeals(page = 1, limit = 20, dealType?: 'FLASH_SALE' | 'GROUP_BUY' | 'LOCAL_DEAL') {
    const response = await apiClient.get('/marketplace/deals', {
      params: { page, limit, dealType }
    })
    return response.data
  }

  async getDeal(dealId: string) {
    const response = await apiClient.get(`/marketplace/deals/${dealId}`)
    return response.data
  }

  async joinGroupBuy(dealId: string) {
    const response = await apiClient.post(`/marketplace/deals/${dealId}/join`)
    return response.data
  }

  // Local deals
  async getLocalDeals(latitude: number, longitude: number, radius = 10, page = 1, limit = 20) {
    const response = await apiClient.get('/marketplace/deals/local', {
      params: { latitude, longitude, radius, page, limit }
    })
    return response.data
  }

  // Trending
  async getTrendingProducts(page = 1, limit = 20) {
    const response = await apiClient.get('/marketplace/trending', {
      params: { page, limit }
    })
    return response.data
  }

  // Recommendations
  async getRecommendedProducts(page = 1, limit = 20) {
    const response = await apiClient.get('/marketplace/recommendations', {
      params: { page, limit }
    })
    return response.data
  }

  // Upload image
  async uploadProductImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiClient.post('/marketplace/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export const marketplaceService = new MarketplaceService()