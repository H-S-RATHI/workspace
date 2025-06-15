import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../../store/authStore';

// Import all API modules
import * as auth from './auth';
import * as users from './users';
import * as chat from './chat';
import * as marketplace from './marketplace';
import * as discover from './discover';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Request interceptor (Authorization header is no longer needed for cookie auth)
// If you need to support Bearer tokens for other clients, you might keep it,
// but for pure HttpOnly cookie auth from browser, it's not necessary.
// For this task, we assume full switch to HttpOnly cookies for the browser client.
/*
api.interceptors.request.use(
  (config) => {
    // const { accessToken } = useAuthStore.getState(); // accessToken no longer stored reliably
    // if (accessToken) { // This logic is removed
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops: check if this is already a retry or a refresh token request.
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      
      const { refreshAccessToken, logout } = useAuthStore.getState();
      
      try {
        // Try to refresh the token. refreshAccessToken in store now calls authAPI.refreshToken()
        // which relies on HttpOnly cookie being sent by browser.
        const refreshedSuccessfully = await refreshAccessToken(); // This calls the store action
        
        if (refreshedSuccessfully) {
          // The new accessToken is now in an HttpOnly cookie, set by the backend.
          // The originalRequest doesn't need its Authorization header manually updated here
          // because the browser will automatically send the new cookie.
          return api(originalRequest); // Retry the original request
        } else {
          // Refresh failed, logout should have been called by refreshAccessToken store action's failure path
          // If not, ensure logout is called.
          logout();
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      } catch (refreshError) {
        // This catch is if refreshAccessToken() itself throws an unhandled error.
        logout(); // Ensure logout
        return Promise.reject(error); // Propagate original error or a new specific error
      }
    }
    
    return Promise.reject(error);
  }
);

// Export all API modules
export const authAPI = auth.authAPI;
export const usersAPI = users.usersAPI;
export const chatAPI = chat.chatAPI;
export const marketplaceAPI = marketplace.marketplaceAPI;
export const discoverAPI = discover.discoverAPI;

// Export the API instance
export { api };
export { api as apiClient }; // For backward compatibility

// Default export is the API instance
export default api;
