import { motion } from 'framer-motion'
import { User, Edit3, MapPin, Calendar, Star, Award, Settings } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

// Profile Tab Component
const ProfileTab = () => {
  const { user } = useAuthStore()
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(251,146,60,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>

      <div className="p-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="glass" className="p-8 mb-8 backdrop-blur-xl border-white/20">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Avatar
                    src={user?.profilePhotoUrl}
                    alt={user?.fullName}
                    size="2xl"
                    status="online"
                    ring={true}
                    gradient={!user?.profilePhotoUrl}
                    fallback={user?.fullName?.charAt(0)}
                  />
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.3, delay: 0.2 }}
                  >
                    <Award className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
                
                <div className="flex-1 text-center md:text-left">
                  <motion.h2 
                    className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {user?.fullName}
                  </motion.h2>
                  <motion.p 
                    className="text-slate-600 text-lg mb-3 font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    @{user?.username}
                  </motion.p>
                  
                  {user?.bio && (
                    <motion.p 
                      className="text-slate-700 mb-6 max-w-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {user.bio}
                    </motion.p>
                  )}
                  
                  {/* User Info */}
                  <motion.div 
                    className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>New York, NY</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined March 2024</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-amber-500" />
                      <span>4.9 Rating</span>
                    </div>
                  </motion.div>
                  
                  {/* Stats */}
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {[
                      { label: 'Posts', value: '156', color: 'from-blue-500 to-cyan-500' },
                      { label: 'Followers', value: '1.2K', color: 'from-purple-500 to-pink-500' },
                      { label: 'Following', value: '890', color: 'from-green-500 to-emerald-500' },
                      { label: 'Listings', value: '23', color: 'from-orange-500 to-red-500' }
                    ].map((stat, index) => (
                      <motion.div 
                        key={stat.label}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      >
                        <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Button
                      variant="gradient"
                      size="lg"
                      icon={<Edit3 className="w-5 h-5" />}
                      className="shadow-lg shadow-orange-200/50"
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      icon={<Settings className="w-5 h-5" />}
                      className="bg-white/80 backdrop-blur-md border-white/20"
                    >
                      Settings
                    </Button>
                  </motion.div>
              </div>
            </div>
          </Card>
          
          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: '1K Followers', icon: '👥', color: 'from-blue-500 to-cyan-500' },
                { name: '100 Sales', icon: '💰', color: 'from-green-500 to-emerald-500' },
                { name: '50 Posts', icon: '📝', color: 'from-purple-500 to-pink-500' },
                { name: 'Verified', icon: '✅', color: 'from-orange-500 to-red-500' }
              ].map((achievement) => (
                <div key={achievement.name} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{achievement.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
                Posts
              </button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">
                Reels
              </button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">
                Listings
              </button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-sm">
                  <span className="text-gray-500 text-2xl">📷</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
  )

const SettingsTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Email Address</h4>
                  <p className="text-gray-600">john@example.com</p>
                </div>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                  Edit
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Phone Number</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                  Edit
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-gray-600">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                  <p className="text-gray-600">Control who can see your profile</p>
                </div>
                <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Location Sharing</h4>
                  <p className="text-gray-600">Show approximate location in posts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h3>
            <div className="space-y-4">
              {[
                { name: 'Messages', desc: 'New messages and chat notifications' },
                { name: 'Comments', desc: 'Comments on your posts and replies' },
                { name: 'Marketplace', desc: 'Sales, purchases, and offers' },
                { name: 'Security', desc: 'Login alerts and security updates' }
              ].map((type) => (
                <div key={type.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">{type.name}</h4>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-6">Danger Zone</h3>
            <div className="p-4 bg-red-50 rounded-xl">
              <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
              <p className="text-red-700 text-sm mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ToolsTab = () => (
  <div className="h-full overflow-y-auto bg-gray-50">
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Tools</h2>
          <p className="text-gray-600">Advanced tools to grow your business</p>
        </div>
        
        {/* Upgrade Notice */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-xl p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-3">Upgrade to Business Pro</h3>
              <p className="text-lg mb-2">Get access to advanced analytics, inventory management, and promotional tools.</p>
              <p className="text-purple-100">Join 10,000+ successful businesses</p>
            </div>
            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Preview Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              Pro Feature
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-4">Track your sales, views, and engagement metrics with detailed insights.</p>
            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span className="text-gray-500">📈 Chart Preview</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              Pro Feature
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Manager</h3>
            <p className="text-gray-600 mb-4">Manage your product inventory and stock levels efficiently.</p>
            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span className="text-gray-500">📋 Inventory Preview</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
              Pro Feature
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Tools</h3>
            <p className="text-gray-600 mb-4">Create targeted campaigns and boost your product visibility.</p>
            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
              <span className="text-gray-500">🚀 Campaign Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ProfilePage = () => {
  const location = useLocation()
  const currentPath = location.pathname

  // Determine which component to render based on the current path
  if (currentPath === '/profile/settings') {
    return <SettingsTab />
  } else if (currentPath === '/profile/tools') {
    return <ToolsTab />
  } else {
    return <ProfileTab />
  }
}
}
export default ProfileTab