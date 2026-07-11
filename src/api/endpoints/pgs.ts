import { apiClient } from '../client';
import type { PgDto } from '../types';

export function listPgs() {
  return apiClient.get<PgDto[]>('/pgs').then((res) => res.data);
}

export function createPg(pg: PgDto) {
  return apiClient.post<PgDto>('/pgs', pg).then((res) => res.data);
}

export function updatePg(pg: PgDto) {
  return apiClient.put<PgDto>(`/pgs/${pg.id}`, pg).then((res) => res.data);
}

export function deletePg(id: string) {
  return apiClient.delete(`/pgs/${id}`);
}
