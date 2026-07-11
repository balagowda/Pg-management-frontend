import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPayment,
  listPayments,
  updatePayment,
  type ListPaymentsParams,
} from '@/api/endpoints/payments';

export function usePayments(params: ListPaymentsParams = {}) {
  return useQuery({
    queryKey: ['payments', params.guestId ?? 'all', params.pgId ?? 'all', params.month ?? 'all'],
    queryFn: () => listPayments(params),
    // Payment status can be promoted to OVERDUE by a nightly job server-side —
    // don't over-cache, refetch readily rather than trusting a stale list.
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['defaulters'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['defaulters'] });
    },
  });
}
