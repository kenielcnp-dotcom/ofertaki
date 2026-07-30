import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listaComprasService } from '../services/lista_compras.service';
import { useAuthContext } from '../contexts/AuthContext';

export function useListaCompras() {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['lista_compras', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listaComprasService.list(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['lista_compras', userId] });
  }

  const addItem = useMutation({
    mutationFn: async (promotionId: string) => {
      if (!userId) throw new Error('Faça login para usar a lista de compras.');
      const { error } = await listaComprasService.add(userId, promotionId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await listaComprasService.remove(id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setPurchased = useMutation({
    mutationFn: async ({ id, isPurchased }: { id: string; isPurchased: boolean }) => {
      const { error } = await listaComprasService.setPurchased(id, isPurchased);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    items: listQuery.data ?? [],
    loading: listQuery.isLoading,
    addItem,
    removeItem,
    setPurchased,
  };
}
