import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listaComprasService } from '../services/lista_compras.service';
import { useAuthContext } from '../contexts/AuthContext';

function isThisMonth(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

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
      const { error } = await listaComprasService.add({ user_id: userId, promotion_id: promotionId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addTextItem = useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error('Faça login para usar a lista de compras.');
      const trimmed = text.trim();
      if (!trimmed) throw new Error('O item não pode estar vazio.');
      const { error } = await listaComprasService.add({ user_id: userId, text: trimmed });
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

  const monthlySavings = useMemo(() => {
    const items = listQuery.data ?? [];
    return items.reduce(
      (acc, item) => {
        if (!item.is_purchased || !item.purchased_at || !item.promotions) return acc;
        if (!isThisMonth(item.purchased_at)) return acc;
        const saved = item.promotions.original_price - item.promotions.price;
        return { total: acc.total + saved, count: acc.count + 1 };
      },
      { total: 0, count: 0 }
    );
  }, [listQuery.data]);

  return {
    items: listQuery.data ?? [],
    loading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    monthlySavings,
    addItem,
    addTextItem,
    removeItem,
    setPurchased,
  };
}
