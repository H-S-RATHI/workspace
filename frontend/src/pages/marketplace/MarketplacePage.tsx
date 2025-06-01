import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'

// Placeholder components for sub-tabs
const ShopTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop</h2>
    
    {/* Categories */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Electronics', 'Fashion', 'Home', 'Sports'].map((category) => (
          <div key={category} className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📱</div>
            <p className="font-medium text-gray-900">{category}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Products Grid */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">For You</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">📷</span>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900 truncate">Product {i}</h4>
              <p className="text-primary-600 font-bold">${(i * 25).toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm text-gray-600 ml-1">4.{i}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const SellTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Sell</h2>
    
    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <button className="bg-primary-600 text-white rounded-lg p-6 text-left hover:bg-primary-700 transition-colors">
        <div className="text-2xl mb-2">📸</div>
        <h3 className="text-lg font-semibold mb-1">Create New Listing</h3>
        <p className="text-primary-100">Take photos and list your item</p>
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">📷</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">My Product {i}</h4>
                <p className="text-primary-600 font-bold">${(i * 50).toFixed(2)}</p>
                <p className="text-sm text-gray-600">Active • 5 views</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                  Edit
                </button>
                <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  Delete
                </button>
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