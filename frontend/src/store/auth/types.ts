import type { User, LoginCredentials, SignupData } from '../../types/auth'

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<{ success: boolean } | void>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  handleLogout: () => void
}

export type AuthStore = AuthState & AuthActions

// Re-export auth types for convenience
export type { User, LoginCredentials, SignupData }