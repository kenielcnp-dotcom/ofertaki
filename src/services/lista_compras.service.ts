import { supabase } from './supabase/client';
import type { ListaCompraInsert, ListaCompraItem, Promotion } from '../types/promotion';

export type ListaCompraWithPromotion = ListaCompraItem & {
  promotions:
    | (Pick<Promotion, 'id' | 'title' | 'image_url' | 'price'> & { mercados: { name: string } | null })
    | null;
};

export const listaComprasService = {
  async list(userId: string) {
    const result = await supabase
      .from('lista_compras')
      .select('*, promotions (id, title, image_url, price, mercados (name))')
      .eq('user_id', userId)
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
