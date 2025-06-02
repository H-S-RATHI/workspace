import { api } from './index'; // Using explicit import to avoid circular dependency

// Track the last request time for rate limiting
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second delay between requests

// Helper function to handle rate limiting
const withRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // If the last request was recent, wait before making a new one
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fn();
};

// Helper function to retry failed requests
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for 4xx errors except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        break;
      }
      
      // Exponential backoff
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Export the API object as a named export
export const chatAPI = {
  getConversations: async (): Promise<{ success: boolean; conversations: any[] }> => {
    return withRateLimit(() => 
      withRetry(async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
      })
    );
  },

  getConversation: async (conversationId: string): Promise<{ success: boolean; conversation: any }> => {
    return withRateLimit(() =>
      withRetry(async () => {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
      })
    );
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{ success: boolean; messages: any[] }> => {
    return withRateLimit(() =>
      withRetry(async () => {
        const response = await api.get(
          `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
        );
        return response.data;
      })
    );
  },

  createConversation: async (data: any): Promise<{ success: boolean; conversation: any }> => {
    return withRateLimit(() =>
      withRetry(async () => {
        const response = await api.post('/chat/conversations', data);
        return response.data;
      })
    );
  },

  sendMessage: async (conversationId: string, data: any): Promise<{ success: boolean; message: any }> => {
    return withRateLimit(() =>
      withRetry(async () => {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, data);
        return response.data;
      })
    );
  },

  uploadMedia: async (file: File, messageType: string): Promise<{ success: boolean; url: string }> => {
    return withRateLimit(() =>
      withRetry(async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', messageType);

        const response = await api.post('/chat/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      })
    );
  },
};
