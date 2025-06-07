import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface CartItem {
  cartItemId: string;
  productId: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  primaryImage?: string;
  sellerUsername: string;
  sellerName: string;
  totalPrice: number;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: (cart: Cart) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  onCheckout,
}) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/marketplace/cart');
      setCart(response.data.cart);
    } catch (error) {
      console.error('Load cart error:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(cartItemId);
      await api.put(`/api/v1/marketplace/cart/items/${cartItemId}`, {
        quantity: newQuantity,
      });

      // Update local state
      setCart(prev => {
        if (!prev) return prev;
        
        const updatedItems = prev.items.map(item => {
          if (item.cartItemId === cartItemId) {
            const updatedItem = {
              ...item,
              quantity: newQuantity,
              totalPrice: item.price * newQuantity,
            };
            return updatedItem;
          }
          return item;
        });

        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        return {
          ...prev,
          items: updatedItems,
          totalAmount,
          totalItems: updatedItems.length,
        };
      });

      toast.success('Quantity updated');
    } catch (error: any) {
      console.error('Update quantity error:', error);
      toast.error(error.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      setUpdating(cartItemId);
      await api.delete(`/api/v1/marketplace/cart/items/${cartItemId}`);

      // Update local state
      setCart(prev => {
        if (!prev) return prev;
        
        const updatedItems = prev.items.filter(item => item.cartItemId !== cartItemId);
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        return {
          ...prev,
          items: updatedItems,
          totalAmount,
          totalItems: updatedItems.length,
        };
      });

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/api/v1/marketplace/cart');
      setCart(prev => prev ? { ...prev, items: [], totalAmount: 0, totalItems: 0 } : null);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      onCheckout?.(cart);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
            {cart && cart.totalItems > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                {cart.totalItems} items
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading cart...</span>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some products to get started</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4">
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.primaryImage ? (
                        <img
                          src={item.primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-500">by {item.sellerName}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {item.currency} {item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating === item.cartItemId}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">
                        {updating === item.cartItemId ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={item.quantity >= item.quantityAvailable || updating === item.cartItemId}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.currency} {item.totalPrice.toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {item.currency} {item.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      disabled={updating === item.cartItemId}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">
                    {cart.currency} {cart.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-500">Calculated at checkout</span>
                </div>
                <hr className="my-3" />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{cart.currency} {cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={clearCart}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Clear Cart
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;