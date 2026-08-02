import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listasService } from '../services/listas.service';
import { useAuthContext } from '../contexts/AuthContext';

export function useListaCompartilhada(listaId: string | undefined, codeEnabled: boolean) {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['lista_membros', listaId],
    queryFn: async () => {
      if (!listaId) return [];
      const { data, error } = await listasService.listMembers(listaId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!listaId,
  });

  const members = membersQuery.data ?? [];
  const isDono = members.some((m) => m.user_id === userId && m.role === 'dono');

  const conviteQuery = useQuery({
    queryKey: ['lista_convite', listaId],
    queryFn: async () => {
      const { data, error } = await listasService.getOrCreateConvite();
      if (error) throw error;
      return data as string;
    },
    enabled: codeEnabled && !!listaId && isDono,
  });

  function invalidateMembers() {
    queryClient.invalidateQueries({ queryKey: ['lista_membros', listaId] });
  }

  const regenerateCode = useMutation({
    mutationFn: async () => {
      const { data, error } = await listasService.regenerateConvite();
      if (error) throw error;
      return data as string;
    },
    onSuccess: (code) => queryClient.setQueryData(['lista_convite', listaId], code),
  });

  const removeMember = useMutation({
    mutationFn: async (membroId: string) => {
      const { error } = await listasService.removeMember(membroId);
      if (error) throw error;
    },
    onSuccess: invalidateMembers,
  });

  const redeemCode = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await listasService.redeemConvite(code);
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha_lista'] });
      queryClient.invalidateQueries({ queryKey: ['lista_compras'] });
      queryClient.invalidateQueries({ queryKey: ['lista_membros'] });
    },
  });

  return {
    members,
    loadingMembers: membersQuery.isLoading,
    isDono,
    code: conviteQuery.data,
    loadingCode: conviteQuery.isLoading,
    regenerateCode,
    removeMember,
    redeemCode,
  };
}
