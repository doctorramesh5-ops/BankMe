import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  full_name: string;
  kyc_status: string;
  is_active: boolean;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  wallet: Wallet | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  wallet: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setWallet: (wallet) => set({ wallet }),
  
  login: async (email, password) => {
    try {
      const response = await authService.login(email, password);
      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      wallet: null,
    });
  },
  
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isLoading: false });
    }
  },
}));
