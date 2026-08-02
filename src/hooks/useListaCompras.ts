import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listaComprasService } from '../services/lista_compras.service';
import { listasService } from '../services/listas.service';
import { supabase } from '../services/supabase/client';
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

  const listaQuery = useQuery({
    queryKey: ['minha_lista', userId],
    queryFn: async () => {
      const { data, error } = await listasService.getOrCreateMyLista();
      if (error) throw error;
      return data as string;
    },
    enabled: !!userId,
    staleTime: Infinity,
  });
  const listaId = listaQuery.data;

  const listQuery = useQuery({
    queryKey: ['lista_compras', listaId],
    queryFn: async () => {
      if (!listaId) return [];
      const { data, error } = await listaComprasService.list(listaId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!listaId,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['lista_compras', listaId] });
  }

  // Sincroniza em tempo real quando outro membro mexe na lista compartilhada.
  // Sufixo aleatório no canal: mesmo padrão de notifications.service.ts, pra
  // não colidir com outra assinatura montada ao mesmo tempo.
  useEffect(() => {
    if (!listaId) return;
    const uniqueId = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`lista_compras:${listaId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lista_compras', filter: `lista_id=eq.${listaId}` },
        invalidate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listaId]);

  const addItem = useMutation({
    mutationFn: async (promotionId: string) => {
      if (!userId || !listaId) throw new Error('Faça login para usar a lista de compras.');
      const { error } = await listaComprasService.add({ lista_id: listaId, user_id: userId, promotion_id: promotionId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const addTextItem = useMutation({
    mutationFn: async (text: string) => {
      if (!userId || !listaId) throw new Error('Faça login para usar a lista de compras.');
      const trimmed = text.trim();
      if (!trimmed) throw new Error('O item não pode estar vazio.');
      const { error } = await listaComprasService.add({ lista_id: listaId, user_id: userId, text: trimmed });
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

  // Economia continua individual mesmo numa lista compartilhada: só conta o
  // que o próprio usuário marcou como comprado, não a lista inteira.
  const monthlySavings = useMemo(() => {
    const items = listQuery.data ?? [];
    return items.reduce(
      (acc, item) => {
        if (!item.is_purchased || !item.purchased_at || !item.promotions) return acc;
        if (item.purchased_by !== userId) return acc;
        if (!isThisMonth(item.purchased_at)) return acc;
        const saved = item.promotions.original_price - item.promotions.price;
        return { total: acc.total + saved, count: acc.count + 1 };
      },
      { total: 0, count: 0 }
    );
  }, [listQuery.data, userId]);

  return {
    listaId,
    items: listQuery.data ?? [],
    loading: listQuery.isLoading || listaQuery.isLoading,
    isError: listQuery.isError || listaQuery.isError,
    refetch: listQuery.refetch,
    monthlySavings,
    addItem,
    addTextItem,
    removeItem,
    setPurchased,
  };
}
