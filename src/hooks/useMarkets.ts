import { useQuery } from '@tanstack/react-query';
import { mercadosService } from '../services/mercados.service';

export function useMarkets() {
  const query = useQuery({
    queryKey: ['mercados'],
    queryFn: async () => {
      const { data, error } = await mercadosService.list();
      if (error) throw error;
      return data ?? [];
    },
  });

  return { markets: query.data ?? [], loading: query.isLoading };
}
