import api from './api';

interface CreateStatusData {
  content?: string;
  mediaUrl?: string | null;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO';
  backgroundColor?: string;
  textColor?: string;
  privacy: 'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM';
  mentionedUsers?: string[];
}

export const statusService = {
  async createStatus(statusData: CreateStatusData) {
    const response = await api.post('/status', statusData);
    return response.data;
  },

  async getStatusFeed() {
    const response = await api.get('/status/feed');
    return response.data;
  },

  async getMyStatuses() {
    const response = await api.get('/status/my-statuses');
    return response.data;
  },

  async viewStatus(statusId: string) {
    const response = await api.post(`/status/${statusId}/view`);
    return response.data;
  }
};
