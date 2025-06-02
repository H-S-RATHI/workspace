import { api } from './index'; // Using explicit import to avoid circular dependency
import type { User } from '../../types/auth';

// Export the API object as a named export
export const usersAPI = {
  getProfile: async (userId: string): Promise<{ success: boolean; user: User }> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  searchUsers: async (query: string): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  followUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId: string): Promise<{ success: boolean; followers: User[] }> => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId: string): Promise<{ success: boolean; following: User[] }> => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
};
