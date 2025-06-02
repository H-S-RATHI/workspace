import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthStore } from './types'
import { createAuthActions, createTokenActions, createUserActions, createLogoutActions } from './actions'
import { AUTH_STORAGE_KEY } from './constants'

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
}

// Create the store with proper typing
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      ...initialState,
      
      // Combine all actions
      ...createAuthActions(set, get),
      ...createTokenActions(set, get),
      ...createUserActions(set, get),
      ...createLogoutActions(set, get),
    }),
    {
      name: AUTH_STORAGE_KEY,
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