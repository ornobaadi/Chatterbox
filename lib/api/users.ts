import { apiClient } from './client';
import { User } from '../types';

export const usersApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const encoded = encodeURIComponent(query);
    return apiClient<User[]>(`/users/search?query=${encoded}`);
  },
};
