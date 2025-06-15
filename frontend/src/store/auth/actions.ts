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
  // setTokens: This function is largely obsolete as tokens are HttpOnly and managed by the browser/backend.
  // If called, it should primarily update isAuthenticated and potentially user state if tokens imply a user session.
  // For now, we'll leave it commented out as its direct purpose (setting JS-accessible tokens) is gone.
  /*
  setTokens: (accessToken: string, refreshToken: string) => {
    set({
      // accessToken, // No longer stored in Zustand state directly from here
      // refreshToken, // No longer stored in Zustand state directly from here
      isAuthenticated: true, // Assuming if this were called, it implies auth
    })
  },
  */

  // refreshAccessToken now relies on the browser sending the HttpOnly refresh token.
  // The backend will set a new HttpOnly access token.
  // This function's role is to trigger the API call and update auth state based on success.
  refreshAccessToken: async () => {
    // No longer get refreshToken from store: const { refreshToken } = get()
    // No longer check for refreshToken presence here.
    
    try {
      // authAPI.refreshToken will be called by the Axios interceptor automatically.
      // This function can be called manually if needed to force a refresh check.
      // It should not need to pass the refresh token; the browser handles it.
      const response = await authAPI.refreshToken(); // Assuming authAPI.refreshToken is adapted
      
      if (response.success) {
        // New accessToken is set as an HttpOnly cookie by the backend.
        // No need to set tokens in Zustand state.
        // We might re-fetch user data or simply confirm isAuthenticated.
        set({ isAuthenticated: true, accessToken: null, refreshToken: null }); // Clear any in-memory tokens
        return true;
      }
      // If refresh fails, the Axios interceptor in api.ts should handle logout.
      get().handleLogout(); // Ensure logout on failure
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().handleLogout(); // Ensure logout on error
      return false;
    }
  }
})

// User Management Actions
export const createUserActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
  setUser: (user: User | null) => { // Allow setting user to null
    set({
      user,
      isAuthenticated: !!user, // isAuthenticated is true if user is not null
      accessToken: null, // Clear any in-memory tokens
      refreshToken: null, // Clear any in-memory tokens
    });
  },

  checkAuth: async () => {
    // With HttpOnly cookies, we can't check for token presence directly in JS.
    // We rely on an API call to a protected route (like /me) to determine auth status.
    // The browser will automatically send cookies.
    set({ isLoading: true });
    try {
      // getCurrentUser will use the cookies automatically.
      // The Axios interceptor will handle 401s and attempt token refresh.
      const userResponse = await authAPI.getCurrentUser();
      
      if (userResponse.success && userResponse.user) {
        set({
          user: userResponse.user,
          isAuthenticated: true,
          isLoading: false,
          accessToken: null, // Clear any in-memory tokens
          refreshToken: null, // Clear any in-memory tokens
        });
      } else {
        // If getCurrentUser fails (e.g. not successful, or user is null),
        // it implies no valid session (even after potential auto-refresh by interceptor).
        get().handleLogout(); // This will set user to null, isAuthenticated to false, isLoading to false.
      }
    } catch (error) {
      // This catch is for network errors or if getCurrentUser itself throws an error
      // not handled by the Axios interceptor's refresh logic (e.g. server error 500).
      console.error('Auth check failed during /me call:', error);
      get().handleLogout(); // Ensure client state is cleared.
    }
    // isLoading is set to false by handleLogout or directly in success case.
  }
})

// Logout Actions
export const createLogoutActions = (
  set: (partial: Partial<AuthStore>) => void,
  get: () => AuthStore
) => ({
  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout(); // Backend clears HttpOnly cookies.
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Even if API fails, clear client state.
    } finally {
      set({
        user: null,
        accessToken: null, // Clear from memory
        refreshToken: null, // Clear from memory
        isAuthenticated: false,
        isLoading: false,
      });
      toast.success('Logged out successfully');
    }
  },

  // Helper function to handle logout logic, typically called internally on auth errors.
  handleLogout: () => {
    // This function should not call authAPI.logout() to prevent loops if called due to API failure.
    set({
      user: null,
      accessToken: null, // Clear from memory
      refreshToken: null, // Clear from memory
      isAuthenticated: false,
      isLoading: false, // Ensure loading is stopped
    });
    // Optionally, inform the user their session ended, if not a user-initiated logout.
    // toast.info('Your session has ended. Please log in again.');
  }
})