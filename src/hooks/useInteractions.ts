import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInteraction } from '../api/interaction';

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInteraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}