import { apiClient } from '../client';
import type { SearchResults } from '../types';

export function search(q: string) {
  return apiClient.get<SearchResults>('/search', { params: { q } }).then((res) => res.data);
}
