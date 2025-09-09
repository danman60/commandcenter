import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClients, updateClientCategory } from '../api/client';
import { ClientCategory } from '../api/types';

export function useClients(params: {
  overdue?: boolean;
  category?: ClientCategory;
  owner?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchClients(params),
    staleTime: 30000,
  });
}

export function useUpdateClientCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, category }: { clientId: string; category: ClientCategory }) =>
      updateClientCategory(clientId, { category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}