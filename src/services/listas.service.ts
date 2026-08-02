import { supabase } from './supabase/client';
import type { ListaMembroWithProfile } from '../types/lista';

export const listasService = {
  async getOrCreateMyLista() {
    return supabase.rpc('get_or_create_my_lista');
  },

  async listMembers(listaId: string) {
    const result = await supabase
      .from('lista_membros')
      .select('*, profiles (username, avatar_url)')
      .eq('lista_id', listaId)
      .order('created_at', { ascending: true });
    return { ...result, data: result.data as ListaMembroWithProfile[] | null };
  },

  async getOrCreateConvite() {
    return supabase.rpc('get_or_create_lista_convite');
  },

  async regenerateConvite() {
    return supabase.rpc('regenerate_lista_convite');
  },

  async redeemConvite(code: string) {
    return supabase.rpc('redeem_lista_convite', { p_code: code });
  },

  async removeMember(membroId: string) {
    return supabase.from('lista_membros').delete().eq('id', membroId);
  },
};
