// StatusTab.tsx - Replace entire file content
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store/authStore';
import StatusViewer from './StatusViewer';
import StatusCreator from './StatusCreator';
import MyStatusCard from './MyStatusCard';
import RecentUpdatesList from './RecentUpdatesList';
import EmptyStatusPlaceholder from './EmptyStatusPlaceholder';

const StatusTab = () => {
  interface Status {
    statusId: string;
    userId: string;
    username: string;
    fullName: string;
    profilePhotoUrl: string;
    content?: string;
    mediaUrl?: string;
    mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
    backgroundColor: string;
    textColor: string;
    privacy: string;
    viewCount: number;
    likeCount: number;
    replyCount: number;
    isLiked: boolean;
    isSaved: boolean;
    hasViewed: boolean;
    mentionedUsers: string[];
    createdAt: string;
    expiresAt: string;
  }

  interface GroupedStatuses {
    user: {
      userId: string;
      username: string;
      fullName: string;
      profilePhotoUrl: string;
    };
    statuses: Status[];
    hasUnviewed: boolean;
  }

  const [statuses, setStatuses] = useState<Status[]>([])
  const [myStatuses, setMyStatuses] = useState<Status[]>([])
  const [showStatusViewer, setShowStatusViewer] = useState(false)
  const [showStatusCreator, setShowStatusCreator] = useState(false)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [selectedUserStatuses, setSelectedUserStatuses] = useState<Status[]>([])
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
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
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
        const refreshed = await useAuthStore.getState().refreshAccessToken()
        if (refreshed) {
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

  const handleViewStatus = async (statusId: string): Promise<boolean> => {
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status/${statusId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.status === 401) {
        const refreshed = await useAuthStore.getState().refreshAccessToken();
        if (refreshed) {
          return handleViewStatus(statusId);
        } else {
          useAuthStore.getState().logout();
          return false;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to mark status as viewed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.message || 'Unknown error',
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in handleViewStatus:', {
        message: error.message,
        statusCode: error.response?.status,
        data: error.response?.data,
      });
      return false;
    }
  }

  const openStatusViewer = (userStatuses: Status[], startIndex: number = 0) => {
    setSelectedUserStatuses(userStatuses)
    setCurrentStatusIndex(startIndex)
    setShowStatusViewer(true)
  }

  const groupStatusesByUser = (): GroupedStatuses[] => {
    const grouped = statuses.reduce<Record<string, GroupedStatuses>>((acc, status) => {
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
    }, {})

    return Object.values(grouped)
  }

  const groupedStatuses: GroupedStatuses[] = groupStatusesByUser()

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStatuses(), fetchMyStatuses()]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] pb-4">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 pb-6"
            >
              <MyStatusCard
                myStatuses={myStatuses}
                onView={() => openStatusViewer(myStatuses)}
                onAdd={() => setShowStatusCreator(true)}
              />

              {groupedStatuses.length > 0 ? (
                <RecentUpdatesList
                  groupedStatuses={groupedStatuses}
                  onView={openStatusViewer}
                  isLoading={isLoading}
                />
              ) : !isLoading ? (
                <EmptyStatusPlaceholder onAddStatus={() => setShowStatusCreator(true)} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Status Viewer */}
      {showStatusViewer && selectedUserStatuses.length > 0 && (
        <StatusViewer
          statuses={selectedUserStatuses}
          currentIndex={currentStatusIndex}
          onClose={() => setShowStatusViewer(false)}
          onPrevious={() => setCurrentStatusIndex(prev => Math.max(prev - 1, 0))}
          onViewStatus={handleViewStatus}
          onLike={async (statusId: string) => {
            console.log('Liking status:', statusId);
          }}
          onReply={async (statusId: string, text: string) => {
            console.log('Replying to status:', statusId, 'with text:', text);
          }}
          onShare={(statusId: string) => {
            console.log('Sharing status:', statusId);
          }}
          onSave={(statusId: string) => {
            console.log('Saving status:', statusId);
          }}
          onReport={(statusId: string) => {
            console.log('Reporting status:', statusId);
          }}
          currentUserId={useAuthStore.getState().user?.userId || ''}
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