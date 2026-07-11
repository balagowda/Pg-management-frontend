import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPg, deletePg, listPgs, updatePg } from '@/api/endpoints/pgs';
import type { PgDto } from '@/api/types';

export function usePgs() {
  return useQuery({ queryKey: ['pgs'], queryFn: listPgs });
}

export function usePg(pgId: string | undefined) {
  const { data, ...rest } = usePgs();
  return { ...rest, data: data?.find((pg) => pg.id === pgId) };
}

export function useCreatePg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPg,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pgs'] }),
  });
}

export function useUpdatePg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePg,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pgs'] }),
  });
}

export function useDeletePg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pgs'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export type { PgDto };
