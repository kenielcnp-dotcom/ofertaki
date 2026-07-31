import { supabase } from './supabase/client';
import type { NotificationWithActor } from '../types/promotion';

export const notificationsService = {
  async list(userId: string) {
    const result = await supabase
      .from('notifications')
      .select('*, profiles!notifications_actor_id_fkey (username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { ...result, data: result.data as NotificationWithActor[] | null };
  },

  async markAsRead(id: string) {
    return supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async markAllAsRead(userId: string) {
    return supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  },

  subscribeToNewNotifications(userId: string, onInsert: () => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        onInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
