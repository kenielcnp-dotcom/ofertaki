import { supabase } from './supabase/client';
import type { ListaCompraInsert, ListaCompraItem, Promotion } from '../types/promotion';
import type { Profile } from '../types/user';

export type ListaCompraWithPromotion = ListaCompraItem & {
  promotions:
    | (Pick<Promotion, 'id' | 'title' | 'image_url' | 'price' | 'original_price'> & {
        mercados: { name: string } | null;
      })
    | null;
  added_by: Pick<Profile, 'id' | 'username'> | null;
  purchased_by_profile: Pick<Profile, 'id' | 'username'> | null;
};

export const listaComprasService = {
  async list(listaId: string) {
    const result = await supabase
      .from('lista_compras')
      .select(
        `*,
        promotions (id, title, image_url, price, original_price, mercados (name)),
        added_by:profiles!lista_compras_user_id_fkey (id, username),
        purchased_by_profile:profiles!lista_compras_purchased_by_fkey (id, username)`
      )
      .eq('lista_id', listaId)
      .order('created_at', { ascending: false });
    return { ...result, data: result.data as ListaCompraWithPromotion[] | null };
  },

  async add(input: ListaCompraInsert) {
    return supabase.from('lista_compras').insert(input).select().single();
  },

  async remove(id: string) {
    return supabase.from('lista_compras').delete().eq('id', id);
  },

  async setPurchased(id: string, isPurchased: boolean) {
    return supabase.from('lista_compras').update({ is_purchased: isPurchased }).eq('id', id);
  },
};
