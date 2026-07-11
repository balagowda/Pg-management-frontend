import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/auth/useAuthStore';
import type { LoginResponse } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Single-flight guard: the backend rotates the refresh token on every use, so
// concurrent 401s must share one in-flight /auth/refresh call rather than
// each firing their own (a second concurrent refresh would present an
// already-rotated, stale refresh token and fail).
let refreshPromise: Promise<LoginResponse> | null = null;

async function refreshSession(): Promise<LoginResponse> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('No refresh token available');

  if (!refreshPromise) {
    refreshPromise = axios
      .post<LoginResponse>(`${baseURL}/auth/refresh`, { refreshToken })
      .then((res) => res.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        const { token, refreshToken, owner } = await refreshSession();
        useAuthStore.getState().setSession({ token, refreshToken, owner });
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        return apiClient(original as AxiosRequestConfig);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
