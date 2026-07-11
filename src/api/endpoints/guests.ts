import { apiClient } from '../client';
import type { GuestDto } from '../types';

export function listGuests(pgId?: string) {
  return apiClient
    .get<GuestDto[]>('/guests', { params: pgId ? { pgId } : undefined })
    .then((res) => res.data);
}

export function createGuest(guest: GuestDto) {
  return apiClient.post<GuestDto>('/guests', guest).then((res) => res.data);
}

export function updateGuest(guest: GuestDto) {
  return apiClient.put<GuestDto>(`/guests/${guest.id}`, guest).then((res) => res.data);
}

export function deleteGuest(id: string) {
  return apiClient.delete(`/guests/${id}`);
}
