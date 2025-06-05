import { api } from './index'; // Using explicit import to avoid circular dependency
import { requestQueue } from '../../utils/requestQueue';

// Helper function to retry failed requests with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use the request queue to ensure rate limiting
      return await requestQueue.enqueue(fn);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for 4xx errors except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        break;
      }
      
      // Exponential backoff with jitter
      if (attempt < maxRetries) {
        const jitter = Math.random() * 1000; // Add up to 1s of jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt) + jitter, 30000); // Cap at 30s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Export the API object as a named export
export const chatAPI = {
  // Get all conversations for the current user
  getConversations: async (): Promise<{ success: boolean; conversations: any[] }> => {
    return withRetry(async () => {
      const response = await api.get('/chat/conversations');
      return response.data;
    });
  },

  // Get a single conversation by ID
  getConversation: async (conversationId: string): Promise<{ success: boolean; conversation: any }> => {
    return withRetry(async () => {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      return response.data;
    });
  },

  // Get messages for a conversation with pagination
  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{ success: boolean; messages: any[] }> => {
    return withRetry(async () => {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });
      return response.data;
    });
  },

  // Create a new conversation
  createConversation: async (data: any): Promise<{ success: boolean; conversation: any }> => {
    return withRetry(async () => {
      const response = await api.post('/chat/conversations', data);
      return response.data;
    });
  },

  // Send a message in a conversation
  sendMessage: async (conversationId: string, data: any): Promise<{ success: boolean; message: any }> => {
    return withRetry(async () => {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, data);
      return response.data;
    });
  },

  // Upload media for a message
  uploadMedia: async (file: File, messageType: string): Promise<{ success: boolean; url: string }> => {
    return withRetry(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', messageType);

      const response = await api.post('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  // Fetch call history with pagination
  getCallHistory: async (page = 1, limit = 20): Promise<{ success: boolean; calls: any[]; pagination: any }> => {
    return withRetry(async () => {
      const response = await api.get('/chat/calls', {
        params: { page, limit }
      });
      return response.data;
    });
  },
};
