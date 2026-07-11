import { apiClient } from '../client';
import type { DefaulterDto } from '../types';

export function listDefaulters() {
  return apiClient.get<DefaulterDto[]>('/defaulters').then((res) => res.data);
}
