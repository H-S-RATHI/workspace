import { api } from './index'; // Using explicit import to avoid circular dependency

// Export the API object as a named export
export const marketplaceAPI = {
  getProducts: async (filters?: any): Promise<{ success: boolean; products: any[]; total: number }> => {
    const response = await api.get('/marketplace/products', { params: filters });
    return response.data;
  },

  getProduct: async (productId: string): Promise<{ success: boolean; product: any }> => {
    const response = await api.get(`/marketplace/products/${productId}`);
    return response.data;
  },

  createProduct: async (data: any): Promise<{ success: boolean; product: any }> => {
    const response = await api.post('/marketplace/products', data);
    return response.data;
  },

  updateProduct: async (productId: string, data: any): Promise<{ success: boolean; product: any }> => {
    const response = await api.put(`/marketplace/products/${productId}`, data);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/marketplace/products/${productId}`);
    return response.data;
  },

  uploadProductImages: async (files: File[]): Promise<{ success: boolean; urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await api.post('/marketplace/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  searchProducts: async (query: string, filters?: any): Promise<{ success: boolean; products: any[]; total: number }> => {
    const response = await api.get('/marketplace/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  getDeals: async (): Promise<{ success: boolean; deals: any[] }> => {
    const response = await api.get('/marketplace/deals');
    return response.data;
  },

  createOrder: async (data: any): Promise<{ success: boolean; order: any }> => {
    const response = await api.post('/marketplace/orders', data);
    return response.data;
  },

  getOrders: async (): Promise<{ success: boolean; orders: any[] }> => {
    const response = await api.get('/marketplace/orders');
    return response.data;
  },
};
