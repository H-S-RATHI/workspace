import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'
import { ProductCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Shop Tab - 2-column mobile, 4-column desktop grid layouts
const ShopTab = () => (
  <div className="p-4 lg:p-6">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Shop</h2>
    
    {/* Categories */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { name: 'Electronics', icon: '📱' },
          { name: 'Fashion', icon: '👕' },
          { name: 'Home', icon: '🏠' },
          { name: 'Sports', icon: '⚽' },
          { name: 'Books', icon: '📚' },
          { name: 'Beauty', icon: '💄' },
          { name: 'Toys', icon: '🧸' },
          { name: 'Food', icon: '🍕' }
        ].map((category) => (
          <button key={category.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{category.icon}</div>
            <p className="font-medium text-gray-900 text-sm">{category.name}</p>
          </button>
        ))}
      </div>
    </div>

    {/* Products Grid - 2-column mobile (165px), 4-column desktop (300px) */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">For You</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { title: 'iPhone 15 Pro Max', price: '$1,199.00', rating: 4.8, badge: 'New' },
          { title: 'MacBook Air M2', price: '$999.00', rating: 4.9 },
          { title: 'Nike Air Jordan 1', price: '$170.00', rating: 4.7, badge: '20% off' },
          { title: 'Sony WH-1000XM5', price: '$399.00', rating: 4.6 },
          { title: 'Samsung Galaxy S24', price: '$899.00', rating: 4.5, badge: 'Hot' },
          { title: 'iPad Pro 12.9"', price: '$1,099.00', rating: 4.8 },
          { title: 'Adidas Ultraboost 22', price: '$180.00', rating: 4.4, badge: 'Sale' },
          { title: 'AirPods Pro 2', price: '$249.00', rating: 4.7 }
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
)

const SellTab = () => (
  <div className="p-4 lg:p-6 max-w-4xl mx-auto">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Sell</h2>
    
    {/* Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <button className="bg-blue-600 text-white rounded-lg p-6 text-left hover:bg-blue-700 transition-colors">
        <div className="text-2xl mb-2">📸</div>
        <h3 className="text-lg font-semibold mb-1">Create New Listing</h3>
        <p className="text-blue-100">Take photos and list your item</p>
      </button>
      
      <button className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-gray-300 transition-colors">
        <div className="text-2xl mb-2">📋</div>
        <h3 className="text-lg font-semibold mb-1 text-gray-900">Manage Listings</h3>
        <p className="text-gray-600">View and edit your active listings</p>
      </button>
    </div>

    {/* My Listings */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">My Listings</h3>
      <div className="space-y-4">
        {[
          { name: 'Vintage Camera', price: 150, views: 23, status: 'Active' },
          { name: 'Gaming Chair', price: 200, views: 12, status: 'Active' },
          { name: 'Smartphone', price: 300, views: 45, status: 'Sold' }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">📷</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  <span className={item.status === 'Sold' ? 'text-green-600' : 'text-blue-600'}>
                    {item.status}
                  </span>
                  {' • '}{item.views} views
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
)

const DealsTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Deals</h2>
    
    {/* Flash Sales */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Flash Sales</h3>
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold">⚡ Flash Sale</h4>
            <p>Up to 70% off selected items</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">02:45:30</div>
            <p className="text-sm">Time left</p>
          </div>
        </div>
      </div>
    </div>

    {/* Group Buys */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Buys</h3>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">📷</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Group Buy Item {i}</h4>
                <p className="text-gray-600">$100 → $80 if 5 people join</p>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${i * 30}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{i * 2}/5</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Local Deals */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Local Deals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Coffee Shop', 'Restaurant'].map((business) => (
          <div key={business} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">🏪</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{business}</h4>
                <p className="text-green-600 font-medium">$10 off your order</p>
                <p className="text-sm text-gray-600">2 km away</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const MarketplacePage = () => {
  const [activeSubTab, setActiveSubTab] = useState('shop')

  const subTabs = [
    { id: 'shop', label: 'Shop', component: ShopTab },
    { id: 'sell', label: 'Sell', component: SellTab },
    { id: 'deals', label: 'Deals', component: DealsTab },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tabs Navigation */}
      <SubTabNavigation
        tabs={subTabs}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ShopTab />} />
          <Route path="/shop" element={<ShopTab />} />
          <Route path="/sell" element={<SellTab />} />
          <Route path="/deals" element={<DealsTab />} />
        </Routes>
      </div>
    </div>
  )
}

export default MarketplacePage