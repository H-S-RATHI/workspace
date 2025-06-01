import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

import { authAPI } from '../services/api'
import type { User, LoginCredentials, SignupData } from '../types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          
          const response = await authAPI.sendOTP(credentials)
          
          if (response.success) {
            toast.success('OTP sent successfully!')
            // Navigate to OTP verification will be handled by the component
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to send OTP')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (data: SignupData) => {
        try {
          set({ isLoading: true })
          
          const response = await authAPI.sendOTP({
            phoneNumber: data.phoneNumber,
            email: data.email,
          })
          
          if (response.success) {
            toast.success('OTP sent successfully!')
            // Navigate to OTP verification will be handled by the component
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to send OTP')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        
        // Call logout API
        authAPI.logout().catch(console.error)
        
        toast.success('Logged out successfully')
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        })
      },

      checkAuth: async () => {
        const { accessToken, refreshToken } = get()
        
        if (!accessToken || !refreshToken) {
          set({ isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          
          // Try to get user info with current token
          const userResponse = await authAPI.getCurrentUser()
          
          if (userResponse.success) {
            set({
              user: userResponse.user,
              isAuthenticated: true,
            })
          } else {
            // Token might be expired, try to refresh
            const refreshed = await get().refreshAccessToken()
            if (!refreshed) {
              get().logout()
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // Try to refresh token
          const refreshed = await get().refreshAccessToken()
          if (!refreshed) {
            get().logout()
          }
        } finally {
          set({ isLoading: false })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        
        if (!refreshToken) {
          return false
        }

        try {
          const response = await authAPI.refreshToken(refreshToken)
          
          if (response.success) {
            set({
              accessToken: response.tokens.accessToken,
              refreshToken: response.tokens.refreshToken,
            })
            return true
          }
          
          return false
        } catch (error) {
          console.error('Token refresh failed:', error)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)