import { api } from './index'; // Using explicit import to avoid circular dependency
import type { 
  LoginCredentials, 
  OTPVerificationData, 
  AuthResponse, 
  OTPResponse,
  RefreshTokenResponse,
  User 
} from '../../types/auth';

// Export the API object as a named export
export const authAPI = {
  sendOTP: async (credentials: LoginCredentials): Promise<OTPResponse> => {
    const response = await api.post('/auth/send-otp', credentials);
    return response.data;
  },

  verifyOTP: async (data: OTPVerificationData): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  enable2FA: async (method: 'SMS' | 'TOTP'): Promise<{ success: boolean; secret?: string; qrCode?: string }> => {
    const response = await api.post('/auth/2fa/enable', { method });
    return response.data;
  },

  verify2FA: async (code: string): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/2fa/verify', { code });
    return response.data;
  },

  disable2FA: async (): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/2fa/disable');
    return response.data;
  },
};
