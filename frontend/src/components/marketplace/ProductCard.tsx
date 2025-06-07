import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, MapPin, Eye, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Product {
  productId: string;
  title: string;
  description: string;
  category: string;
  brand?: string;
  condition: 'NEW' | 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE';
  price: number;
  currency: string;
  locationCity?: string;
  quantityAvailable: number;
  trustScore: number;
  createdAt: string;
  sellerId: string;
  sellerUsername: string;
  sellerName: string;
  sellerPhoto?: string;
  images: Array<{ imageUrl: string; isPrimary: boolean }>;
  primaryImage?: string;
  isInWishlist?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string, isInWishlist: boolean) => void;
  onViewProduct?: (productId: string) => void;
  variant?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onViewProduct,
  variant = 'grid',
}) => {
  const [isInWishlist, setIsInWishlist] = useState(product.isInWishlist || false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'LIKE_NEW':
        return 'bg-blue-100 text-blue-800';
      case 'VERY_GOOD':
        return 'bg-yellow-100 text-yellow-800';
      case 'GOOD':
        return 'bg-orange-100 text-orange-800';
      case 'ACCEPTABLE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      await api.post('/api/v1/marketplace/cart/items', {
        productId: product.productId,
        quantity,
      });
      
      toast.success('Added to cart!');
      onAddToCart?.(product.productId);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await api.delete(`/api/v1/marketplace/wishlist/${product.productId}`);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/api/v1/marketplace/wishlist', {
          productId: product.productId,
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
      
      onAddToWishlist?.(product.productId, !isInWishlist);
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
    }
  };

  const handleViewProduct = () => {
    onViewProduct?.(product.productId);
  };

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex space-x-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={handleViewProduct}>
            {product.primaryImage ? (
              <img
                src={product.primaryImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600" onClick={handleViewProduct}>
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                    {formatCondition(product.condition)}
                  </span>
                  
                  {product.locationCity && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.locationCity}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    {product.trustScore.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {product.currency} {product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {product.quantityAvailable} available
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.quantityAvailable === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAddingToCart ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer overflow-hidden" onClick={handleViewProduct}>
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Wishlist Button */}
        <motion.button
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
            isInWishlist
              ? 'text-red-500 bg-white/90 shadow-lg scale-110'
              : 'text-slate-400 bg-white/70 hover:bg-white/90 hover:text-red-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </motion.button>
        
        {/* Condition Badge */}
        <div className="absolute top-4 left-4">
          <motion.span 
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${getConditionColor(product.condition)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
          >
            {formatCondition(product.condition)}
          </motion.span>
        </div>
        
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            onClick={handleViewProduct}
            className="flex items-center space-x-2 px-6 py-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl hover:bg-white transition-colors shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Quick View</span>
          </motion.button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600" onClick={handleViewProduct}>
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {product.locationCity && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {product.locationCity}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
              {product.trustScore.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {product.currency} {product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {product.quantityAvailable} available
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              disabled={product.quantityAvailable === 0}
            >
              {Array.from({ length: Math.min(product.quantityAvailable, 10) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.quantityAvailable === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
          <img
            src={product.sellerPhoto || '/api/placeholder/24/24'}
            alt={product.sellerName}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">by {product.sellerName}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;