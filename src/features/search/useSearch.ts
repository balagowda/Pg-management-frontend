import { useQuery } from '@tanstack/react-query';
import { search } from '@/api/endpoints/search';

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => search(q),
    enabled: q.trim().length > 0,
    staleTime: 10_000,
  });
}
