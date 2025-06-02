import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'
import type { LoginCredentials, SignupData, User, AuthStore } from './types'

// Authentication Actions
export const createAuthActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
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
  }
})

// Token Management Actions  
export const createTokenActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
  setTokens: (accessToken: string, refreshToken: string) => {
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    })
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
  }
})

// User Management Actions
export const createUserActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
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
  }
})

// Logout Actions
export const createLogoutActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
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

  // Helper function to handle logout logic
  handleLogout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
    authAPI.logout().catch(console.error)
  }
})