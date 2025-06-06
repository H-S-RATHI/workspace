import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store/authStore';
import StatusViewer from './StatusViewer';
import StatusCreator from './StatusCreator';
import MyStatusCard from './MyStatusCard';
import RecentUpdatesList from './RecentUpdatesList';
import EmptyStatusPlaceholder from './EmptyStatusPlaceholder';
import { Button } from '../../../../components/ui/Button';
import { Plus, RefreshCw, Search, X } from 'lucide-react';

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

  // Refresh statuses
  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStatuses(), fetchMyStatuses()]);
    setIsLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Status</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:bg-gray-100"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <MyStatusCard
              myStatuses={myStatuses}
              onView={() => openStatusViewer(myStatuses)}
              onAdd={() => setShowStatusCreator(true)}
            />

            {groupedStatuses.length > 0 && (
              <RecentUpdatesList
                groupedStatuses={groupedStatuses}
                onView={openStatusViewer}
                isLoading={isLoading}
              />
            )}

            {!isLoading && groupedStatuses.length === 0 && (
              <EmptyStatusPlaceholder onAddStatus={() => setShowStatusCreator(true)} />
            )}
          </motion.div>
        </AnimatePresence>
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