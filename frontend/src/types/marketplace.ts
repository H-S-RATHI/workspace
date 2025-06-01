export interface Product {
  productId: string
  sellerId: string
  sellerUsername: string
  sellerPhoto?: string
  title: string
  description: string
  category: string
  brand?: string
  condition: 'NEW' | 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE'
  price: number
  currency: string
  locationCity?: string
  locationCountry?: string
  quantityAvailable: number
  trustScore: number
  status: 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED'
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  imageId: string
  imageUrl: string
  isPrimary: boolean
}

export interface Order {
  orderId: string
  buyerId: string
  sellerId: string
  totalAmount: number
  currency: string
  shippingAddress: string
  shippingMethod: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'REFUNDED'
  items: OrderItem[]
  placedAt: string
  updatedAt: string
}

export interface OrderItem {
  orderItemId: string
  productId: string
  productTitle: string
  productImage?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Deal {
  dealId: string
  sellerId: string
  dealType: 'REFERRAL' | 'GROUP_BUY' | 'FLASH_SALE' | 'SPONSORED'
  productId?: string
  product?: Product
  couponCode?: string
  discountPercent?: number
  startAt: string
  endAt: string
  minParticipants?: number
  currentParticipants: number
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  createdAt: string
}

export interface CreateProductData {
  title: string
  description: string
  category: string
  brand?: string
  condition: string
  price: number
  currency: string
  locationCity?: string
  locationCountry?: string
  quantityAvailable: number
  images: File[]
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  location?: string
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest'
  page?: number
  limit?: number
}

export interface SearchFilters {
  query?: string
  type?: 'all' | 'people' | 'products' | 'videos' | 'hashtags'
  filters?: ProductFilters
}