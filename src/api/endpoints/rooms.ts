import { apiClient } from '../client';
import type { RoomDto } from '../types';

export function listRooms(pgId?: string) {
  return apiClient
    .get<RoomDto[]>('/rooms', { params: pgId ? { pgId } : undefined })
    .then((res) => res.data);
}

export function createRoom(room: RoomDto) {
  return apiClient.post<RoomDto>('/rooms', room).then((res) => res.data);
}

export function updateRoom(room: RoomDto) {
  return apiClient.put<RoomDto>(`/rooms/${room.id}`, room).then((res) => res.data);
}

export function deleteRoom(id: string) {
  return apiClient.delete(`/rooms/${id}`);
}
