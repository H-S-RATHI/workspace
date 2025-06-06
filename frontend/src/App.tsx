import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

import { useAuthStore } from './store/authStore'
import WebSocketProvider from './providers/WebSocketProvider'

// Layout Components
import AuthLayout from './components/layouts/AuthLayout'
import MainLayout from './components/layouts/MainLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import OTPVerificationPage from './pages/auth/OTPVerificationPage'

// Main Pages
import MessagesPage from './pages/messages/MessagesPage'
import DiscoverPage from './pages/discover/DiscoverPage'
import MarketplacePage from './pages/marketplace/MarketplacePage'
import ProfilePage from './pages/profile/ProfilePage'

// Protected Route Component
import ProtectedRoute from './pages/auth/components/ProtectedRoute'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <WebSocketProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </WebSocketProvider>
    )
  }

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="verify-otp" element={<OTPVerificationPage />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Main App Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="messages/*" element={<MessagesPage />} />
            <Route path="discover/*" element={<DiscoverPage />} />
            <Route path="marketplace/*" element={<MarketplacePage />} />
            <Route path="profile/*" element={<ProfilePage />} />
            <Route index element={<Navigate to="/messages" replace />} />
          </Route>

          {/* Redirect unauthenticated users to login */}
          <Route path="*" element={
            user ? <Navigate to="/" replace /> : <Navigate to="/auth/login" replace />
          } />
        </Routes>
      </div>
    </WebSocketProvider>
  )
}

export default App