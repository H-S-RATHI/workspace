import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'
import { useAuthStore } from '../../store/authStore'

// Placeholder components for sub-tabs
const ProfileTab = () => {
  const { user } = useAuthStore()
  
  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-6">
          <img
            src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=3b82f6&color=fff&size=128`}
            alt={user?.fullName}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-600">@{user?.username}</p>
            {user?.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
            
            <div className="flex items-center space-x-6 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">1.2K</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">890</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Listings</div>
              </div>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="flex space-x-4 overflow-x-auto">
          {['1K Followers', '100 Sales', '50 Posts', 'Verified'].map((achievement) => (
            <div key={achievement} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-sm text-gray-600">{achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex border-b border-gray-200 mb-4">
          <button className="px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium">
            Posts
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Reels
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Listings
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
              <span className="text-gray-500">📷</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SettingsTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
    
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email</h4>
              <p className="text-gray-600">john@example.com</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700">Edit</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Phone</h4>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700">Edit</button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-gray-600">Disabled</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700">Enable</button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-gray-600">Public</p>
            </div>
            <select className="border border-gray-300 rounded px-3 py-1">
              <option>Public</option>
              <option>Private</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Location Sharing</h4>
              <p className="text-gray-600">Show approximate location</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          {['Messages', 'Comments', 'Marketplace', 'Security'].map((type) => (
            <div key={type} className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{type}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
)

const ToolsTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Tools</h2>
    
    {/* Upgrade Notice */}
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white mb-6">
      <h3 className="text-xl font-bold mb-2">Upgrade to Business</h3>
      <p className="mb-4">Get access to advanced analytics, inventory management, and promotional tools.</p>
      <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
        Upgrade Now
      </button>
    </div>

    {/* Preview Tools */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6 opacity-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
        <p className="text-gray-600 mb-4">Track your sales, views, and engagement metrics.</p>
        <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
          <span className="text-gray-500">📊 Chart Preview</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 opacity-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory</h3>
        <p className="text-gray-600 mb-4">Manage your product inventory and stock levels.</p>
        <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
          <span className="text-gray-500">📦 Inventory Preview</span>
        </div>
      </div>
    </div>
  </div>
)

const ProfilePage = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile')
  const { user } = useAuthStore()

  const subTabs = [
    { id: 'profile', label: 'Profile', component: ProfileTab },
    { id: 'settings', label: 'Settings', component: SettingsTab },
    ...(user?.isBusinessAccount ? [{ id: 'tools', label: 'Tools', component: ToolsTab }] : []),
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
          <Route path="/" element={<ProfileTab />} />
          <Route path="/profile" element={<ProfileTab />} />
          <Route path="/settings" element={<SettingsTab />} />
          {user?.isBusinessAccount && <Route path="/tools" element={<ToolsTab />} />}
        </Routes>
      </div>
    </div>
  )
}

export default ProfilePage