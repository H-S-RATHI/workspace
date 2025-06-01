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
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Calls</h2>
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">MB</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Mike Brown</h3>
            <p className="text-gray-600 text-sm">Outgoing call • 5 min</p>
          </div>
          <div className="text-xs text-gray-500">3h</div>
        </div>
      </div>
    </div>
  </div>
)

const StatusTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Status</h2>
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-2">My Status</h3>
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-300 transition-colors">
          <div className="text-gray-600">
            <div className="text-2xl mb-2">📸</div>
            <p>Tap to add status update</p>
          </div>
        </button>
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