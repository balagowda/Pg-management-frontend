import { apiClient } from '../client';
import type { LoginResponse } from '../types';

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>('/auth/login', { email, password }).then((res) => res.data);
}

export function register(name: string, email: string, password: string) {
  return apiClient
    .post<LoginResponse>('/auth/register', { name, email, password })
    .then((res) => res.data);
}

export function logout(refreshToken: string) {
  return apiClient.post('/auth/logout', { refreshToken });
}
