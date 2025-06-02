import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ChatTab from './chat/components/ChatTab'
import CallsTab from './calls/components/CallsTab'
import StatusTab from './status/components/StatusTab'

const MessagesPage = () => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  // Determine which component to render based on the current path
  const currentPath = location.pathname
  
  if (currentPath === '/messages/calls') {
    return <CallsTab />
  } else if (currentPath === '/messages/status') {
    return <StatusTab />
  } else {
    return <ChatTab />
  }
}

export default MessagesPage