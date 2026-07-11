import { useQuery } from '@tanstack/react-query';
import { listDefaulters } from '@/api/endpoints/defaulters';

export function useDefaulters() {
  return useQuery({ queryKey: ['defaulters'], queryFn: listDefaulters });
}
