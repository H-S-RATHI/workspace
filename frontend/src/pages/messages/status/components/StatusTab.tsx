import { useEffect, useState } from 'react'
import { Camera, Eye, Clock, Plus } from 'lucide-react'
import { useAuthStore } from '../../../../store/authStore'
import StatusViewer from './StatusViewer'
import StatusCreator from './StatusCreator'

const StatusTab = () => {
  const [statuses, setStatuses] = useState<any[]>([])
  const [myStatuses, setMyStatuses] = useState<any[]>([])
  const [showStatusViewer, setShowStatusViewer] = useState(false)
  const [showStatusCreator, setShowStatusCreator] = useState(false)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [selectedUserStatuses, setSelectedUserStatuses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatuses()
    fetchMyStatuses()
  }, [])

  const fetchStatuses = async () => {
    try {
      const { accessToken } = useAuthStore.getState()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status/feed`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatuses(data.statuses || [])
      } else if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return fetchStatuses()
        } else {
          useAuthStore.getState().logout()
        }
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyStatuses = async () => {
    try {
      const { accessToken } = useAuthStore.getState()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status/my-statuses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyStatuses(data.statuses || [])
      } else if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return fetchMyStatuses()
        } else {
          useAuthStore.getState().logout()
        }
      }
    } catch (error) {
      console.error('Failed to fetch my statuses:', error)
    }
  }

  const handleCreateStatus = async (statusData: any) => {
    try {
      const { accessToken } = useAuthStore.getState()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(statusData),
      })
      
      if (response.ok) {
        await fetchMyStatuses()
        await fetchStatuses()
      } else if (response.status === 401) {
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
          return handleCreateStatus(statusData)
        } else {
          useAuthStore.getState().logout()
        }
      }
    } catch (error) {
      console.error('Failed to create status:', error)
    }
  }

  const handleViewStatus = async (statusId: string) => {
    try {
      const { accessToken } = useAuthStore.getState()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status/${statusId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      
      if (response.status === 401) {
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
          return handleViewStatus(statusId)
        } else {
          useAuthStore.getState().logout()
        }
      }
    } catch (error) {
      console.error('Failed to mark status as viewed:', error)
    }
  }

  const openStatusViewer = (userStatuses: any[], startIndex: number = 0) => {
    setSelectedUserStatuses(userStatuses)
    setCurrentStatusIndex(startIndex)
    setShowStatusViewer(true)
  }

  const groupStatusesByUser = () => {
    const grouped = statuses.reduce((acc, status) => {
      const userId = status.userId
      if (!acc[userId]) {
        acc[userId] = {
          user: {
            userId: status.userId,
            username: status.username,
            fullName: status.fullName,
            profilePhotoUrl: status.profilePhotoUrl,
          },
          statuses: [],
          hasUnviewed: false,
        }
      }
      acc[userId].statuses.push(status)
      if (!status.hasViewed) {
        acc[userId].hasUnviewed = true
      }
      return acc
    }, {} as any)

    return Object.values(grouped)
  }

  const groupedStatuses = groupStatusesByUser()

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Status Updates</h2>
            <p className="text-gray-600">Share what's happening in your life</p>
          </div>
          
          <div className="space-y-6">
            {/* My Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">My Status</h3>
              
              {myStatuses.length > 0 ? (
                <div className="space-y-3">
                  <div 
                    onClick={() => openStatusViewer(myStatuses)}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full border-3 border-blue-500 p-0.5">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">You</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">My Status</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{myStatuses.reduce((sum, s) => sum + s.viewCount, 0)} views</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{myStatuses.length} updates</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowStatusCreator(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add to your status</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowStatusCreator(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <div className="text-gray-600 group-hover:text-blue-600">
                    <Camera className="w-8 h-8 mx-auto mb-3" />
                    <p className="font-medium">Tap to add status update</p>
                    <p className="text-sm text-gray-500 mt-1">Share a photo, video, or text</p>
                  </div>
                </button>
              )}
            </div>

            {/* Recent Updates */}
            {groupedStatuses.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Updates</h3>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedStatuses.map((group: any, index) => (
                      <div 
                        key={group.user.userId}
                        onClick={() => openStatusViewer(group.statuses)}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-3 ${
                          group.hasUnviewed ? 'border-green-500' : 'border-gray-300'
                        } p-0.5`}>
                          <img
                            src={group.user.profilePhotoUrl || `https://ui-avatars.com/api/?name=${group.user.fullName}&background=3b82f6&color=fff`}
                            alt={group.user.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{group.user.fullName}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{group.statuses.length} update{group.statuses.length > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{new Date(group.statuses[0].createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {group.hasUnviewed && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoading && groupedStatuses.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No status updates yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  When your contacts share status updates, they'll appear here. Be the first to share yours!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Viewer */}
      {showStatusViewer && (
        <StatusViewer
          statuses={selectedUserStatuses}
          currentIndex={currentStatusIndex}
          onClose={() => setShowStatusViewer(false)}
          onNext={() => setCurrentStatusIndex(prev => Math.min(prev + 1, selectedUserStatuses.length - 1))}
          onPrevious={() => setCurrentStatusIndex(prev => Math.max(prev - 1, 0))}
          onViewStatus={handleViewStatus}
        />
      )}

      {/* Status Creator */}
      <StatusCreator
        isOpen={showStatusCreator}
        onClose={() => setShowStatusCreator(false)}
        onCreateStatus={handleCreateStatus}
      />
    </div>
  )
}

export default StatusTab