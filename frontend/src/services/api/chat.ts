import { api } from './index'; // Using explicit import to avoid circular dependency

// Export the API object as a named export
export const chatAPI = {
  getConversations: async (): Promise<{ success: boolean; conversations: any[] }> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getConversation: async (conversationId: string): Promise<{ success: boolean; conversation: any }> => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{ success: boolean; messages: any[] }> => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createConversation: async (data: any): Promise<{ success: boolean; conversation: any }> => {
    const response = await api.post('/chat/conversations', data);
    return response.data;
  },

  sendMessage: async (conversationId: string, data: any): Promise<{ success: boolean; message: any }> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  uploadMedia: async (file: File, messageType: string): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', messageType);

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
