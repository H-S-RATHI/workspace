import { useLocation } from 'react-router-dom'
import { ProductCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Shop Tab - 2-column mobile, 4-column desktop grid layouts
const ShopTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop</h2>
          <p className="text-gray-600">Discover amazing products from our community</p>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: 'Electronics', icon: '📱', color: 'from-blue-500 to-cyan-500' },
              { name: 'Fashion', icon: '👕', color: 'from-pink-500 to-rose-500' },
              { name: 'Home', icon: '🏠', color: 'from-green-500 to-emerald-500' },
              { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-amber-500' },
              { name: 'Books', icon: '📚', color: 'from-purple-500 to-violet-500' },
              { name: 'Beauty', icon: '💄', color: 'from-red-500 to-pink-500' },
              { name: 'Toys', icon: '🧸', color: 'from-yellow-500 to-orange-500' },
              { name: 'Food', icon: '🍕', color: 'from-indigo-500 to-blue-500' }
            ].map((category) => (
              <button key={category.name} className={`bg-gradient-to-br ${category.color} text-white rounded-xl p-4 text-center hover:scale-105 transition-all duration-200 shadow-md`}>
                <div className="text-2xl mb-2">{category.icon}</div>
                <p className="font-medium text-sm">{category.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { title: 'iPhone 15 Pro Max', price: '$1,199.00', rating: 4.8, badge: 'New' },
              { title: 'MacBook Air M2', price: '$999.00', rating: 4.9 },
              { title: 'Nike Air Jordan 1', price: '$170.00', rating: 4.7, badge: '20% off' },
              { title: 'Sony WH-1000XM5', price: '$399.00', rating: 4.6 },
              { title: 'Samsung Galaxy S24', price: '$899.00', rating: 4.5, badge: 'Hot' },
              { title: 'iPad Pro 12.9"', price: '$1,099.00', rating: 4.8 },
              { title: 'Adidas Ultraboost 22', price: '$180.00', rating: 4.4, badge: 'Sale' },
              { title: 'AirPods Pro 2', price: '$249.00', rating: 4.7 },
              { title: 'Tesla Model Y', price: '$52,990.00', rating: 4.9, badge: 'Premium' },
              { title: 'Gaming Setup', price: '$2,499.00', rating: 4.6, badge: 'Bundle' }
            ].map((product, index) => (
              <ProductCard
                key={index}
                image={`/api/placeholder/300/300`}
                title={product.title}
                price={product.price}
                rating={product.rating}
                badge={product.badge}
                onClick={() => console.log('Product clicked:', product.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SellTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sell</h2>
          <p className="text-gray-600">Turn your items into cash with our marketplace</p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <button className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl p-8 text-left hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-xl font-bold mb-2">Create New Listing</h3>
            <p className="text-green-100">Take photos and list your item in minutes</p>
          </button>
          
          <button className="bg-white border border-gray-200 rounded-xl p-8 text-left hover:border-gray-300 hover:shadow-md transition-all duration-200">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Manage Listings</h3>
            <p className="text-gray-600">View and edit your active listings</p>
          </button>
        </div>

        {/* My Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">My Listings</h3>
          <div className="space-y-4">
            {[
              { name: 'Vintage Camera', price: 150, views: 23, status: 'Active', image: '📷' },
              { name: 'Gaming Chair', price: 200, views: 12, status: 'Active', image: '🪑' },
              { name: 'Smartphone', price: 300, views: 45, status: 'Sold', image: '📱' },
              { name: 'Bicycle', price: 450, views: 18, status: 'Active', image: '🚲' }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                    <p className="text-green-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Sold' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                      <span className="ml-2">{item.views} views</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const DealsTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deals</h2>
          <p className="text-gray-600">Exclusive offers and limited-time deals</p>
        </div>
        
        {/* Flash Sales */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flash Sales</h3>
          <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-xl p-8 text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold mb-2">⚡ Flash Sale</h4>
                <p className="text-lg">Up to 70% off selected items</p>
                <p className="text-red-100 mt-1">Limited time offer!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">02:45:30</div>
                <p className="text-red-100">Time left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Buys */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Buys</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Wireless Earbuds', originalPrice: 100, groupPrice: 80, joined: 3, target: 5, progress: 60 },
              { name: 'Smart Watch', originalPrice: 200, groupPrice: 160, joined: 2, target: 5, progress: 40 }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl">
                    🛍️
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h4>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-gray-500 line-through">${item.originalPrice}</span>
                      <span className="text-green-600 font-bold text-lg">${item.groupPrice}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round((1 - item.groupPrice / item.originalPrice) * 100)}% off
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>{item.joined}/{item.target} people joined</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Join Group Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Deals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Deals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Coffee Shop', deal: '$10 off your order', distance: '2 km', icon: '☕' },
              { name: 'Restaurant', deal: '20% off dinner', distance: '1.5 km', icon: '🍽️' },
              { name: 'Gym', deal: 'Free trial week', distance: '3 km', icon: '💪' },
              { name: 'Bookstore', deal: 'Buy 2 get 1 free', distance: '2.5 km', icon: '📚' }
            ].map((business, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                    {business.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{business.name}</h4>
                    <p className="text-green-600 font-medium">{business.deal}</p>
                    <p className="text-sm text-gray-500">{business.distance} away</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const MarketplacePage = () => {
  const location = useLocation()
  const currentPath = location.pathname

  // Determine which component to render based on the current path
  if (currentPath === '/marketplace/sell') {
    return <SellTab />
  } else if (currentPath === '/marketplace/deals') {
    return <DealsTab />
  } else {
    return <ShopTab />
  }
}

export default MarketplacePage