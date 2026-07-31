import type { Database } from './database.types';
import type { Profile } from './user';

export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Confirmation = Database['public']['Tables']['confirmations']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type ListaCompraItem = Database['public']['Tables']['lista_compras']['Row'];
export type ListaCompraInsert = Database['public']['Tables']['lista_compras']['Insert'];
export type Market = Database['public']['Tables']['mercados']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportReason = 'expired' | 'fake' | 'wrong_price' | 'inappropriate' | 'other';

export type PromotionWithMarket = Promotion & {
  mercados: Pick<Market, 'name'> | null;
};

export type NotificationWithActor = Notification & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
};
