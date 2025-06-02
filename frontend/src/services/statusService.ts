import { api } from './api';

// Types
export type MediaType = 'TEXT' | 'IMAGE' | 'VIDEO';
export type PrivacyType = 'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM';

export interface Status {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  backgroundColor: string | null;
  textColor: string | null;
  privacy: PrivacyType;
  views: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  isViewed: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  mentionedUsers: Array<{
    id: string;
    username: string;
    avatar: string | null;
  }>;
}

export interface CreateStatusData {
  content?: string;
  mediaUrl?: string | null;
  mediaType: MediaType;
  backgroundColor?: string;
  textColor?: string;
  privacy: PrivacyType;
  mentionedUsers?: string[];
}

export interface StatusResponse {
  success: boolean;
  message?: string;
  status?: Status;
  statuses?: Status[];
  error?: string;
}

/**
 * Service for handling status-related API calls
 */
export const statusService = {
  /**
   * Create a new status
   */
  async createStatus(statusData: CreateStatusData): Promise<StatusResponse> {
    try {
      const response = await api.post<StatusResponse>('/status', statusData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create status',
      };
    }
  },

  /**
   * Get the status feed for the current user
   */
  async getStatusFeed(): Promise<StatusResponse> {
    try {
      const response = await api.get<StatusResponse>('/status/feed');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching status feed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch status feed',
      };
    }
  },

  /**
   * Get statuses for the current user
   */
  async getMyStatuses(): Promise<StatusResponse> {
    try {
      const response = await api.get<StatusResponse>('/status/my-statuses');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user statuses:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user statuses',
      };
    }
  },

  /**
   * Record a view for a status
   */
  async viewStatus(statusId: string): Promise<StatusResponse> {
    try {
      const response = await api.post<StatusResponse>(`/status/${statusId}/view`);
      return response.data;
    } catch (error: any) {
      console.error('Error viewing status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to record status view',
      };
    }
  },

  /**
   * Like a status
   */
  async likeStatus(statusId: string): Promise<StatusResponse> {
    try {
      const response = await api.post<StatusResponse>(`/status/${statusId}/like`);
      return response.data;
    } catch (error: any) {
      console.error('Error liking status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to like status',
      };
    }
  },

  /**
   * Unlike a status
   */
  async unlikeStatus(statusId: string): Promise<StatusResponse> {
    try {
      const response = await api.delete<StatusResponse>(`/status/${statusId}/like`);
      return response.data;
    } catch (error: any) {
      console.error('Error unliking status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unlike status',
      };
    }
  },

  /**
   * Delete a status
   */
  async deleteStatus(statusId: string): Promise<StatusResponse> {
    try {
      const response = await api.delete<StatusResponse>(`/status/${statusId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete status',
      };
    }
  },
};
