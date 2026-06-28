import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  profile: {
    fullName: string | null;
    displayName: string | null;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/v1/internal/auth/login', { email, password });
      const { user, tokens } = response.data;
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('/api/v1/internal/auth/logout', { refreshToken }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await axios.get('/api/v1/internal/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // Try refresh token logic here if needed, or just clear auth
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshRes = await axios.post('/api/v1/internal/auth/refresh', { refreshToken });
            const { user, tokens } = refreshRes.data;
            
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            
            set({ user, isAuthenticated: true, isLoading: false });
            return;
          } catch (refreshErr) {
            console.error('Refresh failed', refreshErr);
          }
        }
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));

// Configure axios interceptor for outgoing requests to attach token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.url && !config.url.includes('/auth/login') && !config.url.includes('/auth/refresh')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
