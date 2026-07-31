import type { Database } from './database.types';

export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Confirmation = Database['public']['Tables']['confirmations']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type ListaCompraItem = Database['public']['Tables']['lista_compras']['Row'];
export type ListaCompraInsert = Database['public']['Tables']['lista_compras']['Insert'];
export type Market = Database['public']['Tables']['mercados']['Row'];

export type PromotionWithMarket = Promotion & {
  mercados: Pick<Market, 'name'> | null;
};
