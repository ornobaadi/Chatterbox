import { create } from 'zustand';
import { User } from '../types';
import { authApi, LoginPayload } from '../api/auth';
import { useChatStore } from './chatStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initAuth: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const TOKEN_KEY = 'chatterbox_token';
const USER_KEY = 'chatterbox_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        set({
          token: savedToken,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });

        // Verify token in background
        authApi.getMe()
          .then((freshUser) => {
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            set({ user: freshUser });
          })
          .catch(() => {
            // Token expired or invalid
            get().logout();
          });
        return;
      } catch {
        get().logout();
      }
    }

    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        // Set cookie as well for any SSR check
        document.cookie = `chatterbox_token=${response.token}; path=/; max-age=2592000; SameSite=Lax`;
      }
      useChatStore.getState().resetChatStore();
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = 'chatterbox_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    useChatStore.getState().resetChatStore();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
