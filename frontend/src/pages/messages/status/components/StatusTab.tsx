// StatusTab.tsx - Replace entire file content
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store/authStore';
import StatusViewer from './StatusViewer';
import StatusCreator from './StatusCreator';
import MyStatusCard from './MyStatusCard';
import RecentUpdatesList from './RecentUpdatesList';
import EmptyStatusPlaceholder from './EmptyStatusPlaceholder';
import { Button } from '../../../../components/ui/Button';
import { RefreshCw, Search, Plus, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-white/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-bounce"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Status</h1>
                <p className="text-sm text-gray-500">Share your moments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-xl hover:bg-white/60 backdrop-blur-sm border border-white/30 shadow-sm transition-all duration-300 hover:scale-105"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-xl hover:bg-white/60 backdrop-blur-sm border border-white/30 shadow-sm transition-all duration-300 hover:scale-105"
              >
                <Search className="h-4 w-4 text-gray-600" />
              </Button>
              
              <Button 
                onClick={() => setShowStatusCreator(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 pb-8"
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