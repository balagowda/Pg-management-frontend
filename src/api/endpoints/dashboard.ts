import { apiClient } from '../client';
import type { DashboardDto } from '../types';

export function getDashboard() {
  return apiClient.get<DashboardDto>('/dashboard').then((res) => res.data);
}
