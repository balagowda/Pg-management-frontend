import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGuest, deleteGuest, listGuests, updateGuest } from '@/api/endpoints/guests';

export function useGuests(pgId?: string) {
  return useQuery({
    queryKey: ['guests', pgId ?? 'all'],
    queryFn: () => listGuests(pgId),
  });
}

export function useGuest(guestId: string | undefined) {
  const { data, ...rest } = useGuests();
  return { ...rest, data: data?.find((guest) => guest.id === guestId) };
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGuest,
    onSuccess: (guest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      // Creating a guest auto-creates a current-month payment row server-side.
      queryClient.invalidateQueries({ queryKey: ['payments', guest.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGuest,
    onSuccess: (guest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['payments', guest.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
