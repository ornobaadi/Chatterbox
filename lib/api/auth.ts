import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export interface LoginPayload {
  phone: string;
  name: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: async (): Promise<User> => {
    return apiClient<User>('/auth/me');
  },
};
