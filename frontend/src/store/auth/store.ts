import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthStore } from './types'
import { createAuthActions, createTokenActions, createUserActions, createLogoutActions } from './actions'
import { AUTH_STORAGE_KEY } from './constants'

// Initial state - tokens are no longer stored in Zustand
const initialState = {
  user: null,
  accessToken: null, // Will be kept in state but not persisted; for potential non-HttpOnly uses or debugging
  refreshToken: null, // Will be kept in state but not persisted
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
      ...createTokenActions(set, get), // Actions will be modified
      ...createUserActions(set, get), // Actions will be modified
      ...createLogoutActions(set, get), // Actions will be modified
    }),
    {
      name: AUTH_STORAGE_KEY,
      // Only persist user-related fields. Tokens are in HttpOnly cookies.
      partialize: (state) => ({
        user: state.user,
        // isAuthenticated is true if the user object exists.
        // Actual session validity is confirmed by successful API calls to protected endpoints.
        isAuthenticated: !!state.user,
      }),
      // onRehydrateStorage: (state) => {
      //   // Optional: Can perform actions upon rehydration
      //   console.log('AuthStore rehydrated');
      //   // Potentially trigger checkAuth here if needed, though App.tsx usually handles this.
      // },
    }
  )
)