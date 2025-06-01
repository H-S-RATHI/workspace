import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'
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
  signup: (data: SignupData) => Promise<{ success: boolean } | void>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  handleLogout: () => void
}

// Define the store type
type AuthStore = AuthState & AuthActions

// Create the store with proper typing
// Create the store with proper typing
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
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
          
          // Create a new object with only the properties that LoginCredentials expects
          const loginCredentials: LoginCredentials = {
            phoneNumber: data.phoneNumber,
            email: data.email,
          };
          
          // Add fullName to the request body as a separate property
          const response = await authAPI.sendOTP({
            ...loginCredentials,
            fullName: data.fullName, // This will be used by the backend to identify signup requests
          } as any) // Type assertion needed because LoginCredentials doesn't include fullName
          
          if (response.success) {
            toast.success('OTP sent successfully!')
            // Navigate to OTP verification will be handled by the component
            return { success: true }
          }
          
          return { success: false }
        } catch (error: any) {
          if (error.response?.data?.errorCode === 'ACCOUNT_EXISTS') {
            // This will be handled by the component to redirect to login
            throw new Error('ACCOUNT_EXISTS')
          }
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
              get().handleLogout()
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // Try to refresh token
          const refreshed = await get().refreshAccessToken()
          if (!refreshed) {
            get().handleLogout()
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
              isAuthenticated: true,
            })
            return true
          }
          
          return false
        } catch (error) {
          console.error('Token refresh failed:', error)
          return false
        }
      },
      
      // Helper function to handle logout logic
      handleLogout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        authAPI.logout().catch(console.error)
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: !!state.accessToken && !!state.user,
      }),
    }
  )
)