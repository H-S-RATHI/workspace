import { api } from './index'; // Using explicit import to avoid circular dependency

// Export the API object as a named export
export const discoverAPI = {
  getFeed: async (type = 'for_you', page = 1): Promise<{ success: boolean; posts: any[]; hasMore: boolean }> => {
    const response = await api.get(`/discover/feed?type=${type}&page=${page}`);
    return response.data;
  },

  getReels: async (page = 1): Promise<{ success: boolean; reels: any[]; hasMore: boolean }> => {
    const response = await api.get(`/discover/reels?page=${page}`);
    return response.data;
  },

  createPost: async (data: any): Promise<{ success: boolean; post: any }> => {
    const response = await api.post('/discover/posts', data);
    return response.data;
  },

  createReel: async (data: any): Promise<{ success: boolean; reel: any }> => {
    const response = await api.post('/discover/reels', data);
    return response.data;
  },

  likePost: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/discover/posts/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/discover/posts/${postId}/like`);
    return response.data;
  },

  commentOnPost: async (postId: string, comment: string): Promise<{ success: boolean; comment: any }> => {
    const response = await api.post(`/discover/posts/${postId}/comments`, { comment });
    return response.data;
  },

  search: async (query: string, type = 'all'): Promise<{ success: boolean; results: any }> => {
    const response = await api.get(`/discover/search?q=${encodeURIComponent(query)}&type=${type}`);
    return response.data;
  },
};
