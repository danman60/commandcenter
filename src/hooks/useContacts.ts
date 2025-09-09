import { useQuery } from '@tanstack/react-query';
import { fetchContacts } from '../api/contact';

export function useContacts(params: {
  clientId?: string;
  owner?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => fetchContacts(params),
    staleTime: 30000,
  });
}