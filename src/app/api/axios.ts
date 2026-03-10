
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../config/env';
import { STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── API Client Helpers ─────────────────────────────────────────────────────

export const setAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ token }));
};

export const getAuthToken = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return '';
    const { token } = JSON.parse(stored);
    return token || '';
  } catch {
    return '';
  }
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
};

export default client;

