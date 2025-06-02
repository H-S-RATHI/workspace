import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ConversationList } from '../../components/chat/ConversationList'
import { ChatWindow } from '../../components/chat/ChatWindow'
import SubTabNavigation from '../../components/ui/SubTabNavigation'

// Placeholder components for sub-tabs
const ChatTab = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="flex h-full">
      <ConversationList />
      <ChatWindow />
    </div>
  )
}

const CallsTab = () => (
  <div className="p-4 lg:p-6">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Calls</h2>
    <div className="space-y-3">
      {[
        { name: 'Mike Brown', type: 'Outgoing', duration: '5 min', time: '3h', avatar: '/api/placeholder/40/40' },
        { name: 'Sarah Wilson', type: 'Incoming', duration: '12 min', time: '1d', avatar: '/api/placeholder/40/40' },
        { name: 'John Doe', type: 'Missed', duration: '0 min', time: '2d', avatar: '/api/placeholder/40/40' },
      ].map((call, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {call.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{call.name}</h3>
              <p className={`text-sm ${
                call.type === 'Missed' ? 'text-red-600' : 
                call.type === 'Incoming' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {call.type} call • {call.duration}
              </p>
            </div>
            <div className="text-xs text-gray-500">{call.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const StatusTab = () => (
  <div className="p-4 lg:p-6">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Status</h2>
    <div className="space-y-4">
      {/* My Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">My Status</h3>
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center hover:border-blue-300 transition-colors">
          <div className="text-gray-600">
            <div className="text-2xl mb-2">📸</div>
            <p className="text-sm lg:text-base">Tap to add status update</p>
          </div>
        </button>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Recent Updates</h3>
        <div className="space-y-3">
          {[
            { name: 'Alice Johnson', time: '2h ago', viewed: false },
            { name: 'Bob Smith', time: '5h ago', viewed: true },
            { name: 'Carol Davis', time: '1d ago', viewed: true },
          ].map((status, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className={`w-10 h-10 rounded-full border-2 ${
                status.viewed ? 'border-gray-300' : 'border-green-500'
              } p-0.5`}>
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {status.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{status.name}</h4>
                <p className="text-xs text-gray-500">{status.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const MessagesPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('chat')
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  const subTabs = [
    { id: 'chat', label: 'Chat', component: ChatTab },
    { id: 'calls', label: 'Calls', component: CallsTab },
    { id: 'status', label: 'Status', component: StatusTab },
  ]

  if (!isAuthenticated) {
    return null
  }

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
        {activeSubTab === 'chat' && <ChatTab />}
        {activeSubTab === 'calls' && <CallsTab />}
        {activeSubTab === 'status' && <StatusTab />}
      </div>
    </div>
  )
}

export default MessagesPage