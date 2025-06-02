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
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops by checking if this is already a retry or a refresh token request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('auth/refresh-token')) {
      originalRequest._retry = true;
      
      const { refreshAccessToken, logout } = useAuthStore.getState();
      
      try {
        // Try to refresh the token
        const success = await refreshAccessToken();
        
        if (success) {
          // Update the auth header with the new token
          const { accessToken } = useAuthStore.getState();
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          // Retry the original request
          return api(originalRequest);
        } else {
          logout();
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      } catch (refreshError) {
        logout();
        return Promise.reject(error);
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
