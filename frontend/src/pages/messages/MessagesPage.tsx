import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

import SubTabNavigation from '../../components/ui/SubTabNavigation'

// Placeholder components for sub-tabs
const ChatTab = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat</h2>
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">JD</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">John Doe</h3>
            <p className="text-gray-600 text-sm">Hey, how are you doing?</p>
          </div>
          <div className="text-xs text-gray-500">2m</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold">AS</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Alice Smith</h3>
            <p className="text-gray-600 text-sm">Thanks for the help!</p>
          </div>
          <div className="text-xs text-gray-500">1h</div>
        </div>
      </div>
    </div>
  </div>
)

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

  const subTabs = [
    { id: 'chat', label: 'Chat', component: ChatTab },
    { id: 'calls', label: 'Calls', component: CallsTab },
    { id: 'status', label: 'Status', component: StatusTab },
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
          <Route path="/" element={<ChatTab />} />
          <Route path="/chat" element={<ChatTab />} />
          <Route path="/calls" element={<CallsTab />} />
          <Route path="/status" element={<StatusTab />} />
        </Routes>
      </div>
    </div>
  )
}

export default MessagesPage