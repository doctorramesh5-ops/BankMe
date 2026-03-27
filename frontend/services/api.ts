import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// KYC Services
export const kycService = {
  verifyKYC: async (data: any) => {
    const response = await api.post('/kyc/verify', data);
    return response.data;
  },
  
  getKYCStatus: async (userId: string) => {
    const response = await api.get(`/kyc/status/${userId}`);
    return response.data;
  },
};

// Wallet Services
export const walletService = {
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },
  
  topup: async (data: any) => {
    const response = await api.post('/wallet/topup', data);
    return response.data;
  },
  
  transfer: async (data: any) => {
    const response = await api.post('/wallet/transfer', data);
    return response.data;
  },
  
  getTransactions: async (limit = 50, skip = 0) => {
    const response = await api.get(`/wallet/transactions?limit=${limit}&skip=${skip}`);
    return response.data;
  },
};

// Services
export const financialServices = {
  aeps: async (data: any) => {
    const response = await api.post('/services/aeps', data);
    return response.data;
  },
  
  dmt: async (data: any) => {
    const response = await api.post('/services/dmt', data);
    return response.data;
  },
  
  bbps: async (data: any) => {
    const response = await api.post('/services/bbps', data);
    return response.data;
  },
  
  irctc: async (data: any) => {
    const response = await api.post('/services/irctc', data);
    return response.data;
  },
  
  bus: async (data: any) => {
    const response = await api.post('/services/bus', data);
    return response.data;
  },
  
  travel: async (data: any) => {
    const response = await api.post('/services/travel', data);
    return response.data;
  },
};

// Shop Services
export const shopService = {
  register: async (data: any) => {
    const response = await api.post('/shops/register', data);
    return response.data;
  },
  
  getNearby: async (latitude: number, longitude: number, radius = 5.0) => {
    const response = await api.get(`/shops/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radius}`);
    return response.data;
  },
  
  recordVisit: async (data: any) => {
    const response = await api.post('/shops/visit', data);
    return response.data;
  },
};

// Hierarchy Services
export const hierarchyService = {
  getTree: async (userId: string) => {
    const response = await api.get(`/hierarchy/tree/${userId}`);
    return response.data;
  },
  
  getCommissionReport: async () => {
    const response = await api.get('/reports/commission');
    return response.data;
  },
};

export default api;
