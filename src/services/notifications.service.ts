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
    // Sufixo aleatório: mais de uma tela pode chamar isso ao mesmo tempo
    // (ex: sino no header da Home + tela de Alertas, ambas montadas como
    // abas) — sem isso, duas inscrições tentam usar o mesmo nome de canal.
    const uniqueId = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`notifications:${userId}:${uniqueId}`)
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
