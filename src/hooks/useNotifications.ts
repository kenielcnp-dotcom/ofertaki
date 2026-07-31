import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { useAuthContext } from '../contexts/AuthContext';

export function useNotifications() {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await notificationsService.list(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = notificationsService.subscribeToNewNotifications(userId, () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    });
    return unsubscribe;
  }, [userId, queryClient]);

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Faça login para ver notificações.');
      return notificationsService.markAllAsRead(userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    markAsRead,
    markAllAsRead,
  };
}
