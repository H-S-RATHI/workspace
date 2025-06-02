const CallsTab = () => (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Calls</h2>
          <p className="text-gray-600">Manage your call history and make new calls</p>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Mike Brown', type: 'Outgoing', duration: '5 min', time: '3h', avatar: '/api/placeholder/40/40' },
            { name: 'Sarah Wilson', type: 'Incoming', duration: '12 min', time: '1d', avatar: '/api/placeholder/40/40' },
            { name: 'John Doe', type: 'Missed', duration: '0 min', time: '2d', avatar: '/api/placeholder/40/40' },
            { name: 'Emma Davis', type: 'Outgoing', duration: '8 min', time: '3d', avatar: '/api/placeholder/40/40' },
            { name: 'Alex Johnson', type: 'Incoming', duration: '15 min', time: '5d', avatar: '/api/placeholder/40/40' },
          ].map((call, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {call.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{call.name}</h3>
                  <p className={`text-sm ${
                    call.type === 'Missed' ? 'text-red-600' : 
                    call.type === 'Incoming' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {call.type} call • {call.duration}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{call.time}</div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  
  export default CallsTab