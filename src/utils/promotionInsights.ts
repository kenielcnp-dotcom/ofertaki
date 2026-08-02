import type { Promotion } from '../types/promotion';

const HOT_DEAL_MIN_CONFIRMATIONS = 10;
const HOT_DEAL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Regra automática de "oferta quente": confirmações altas pouco tempo depois de publicada. */
export function isHotDeal(promotion: Pick<Promotion, 'confirmations_count' | 'created_at'>): boolean {
  const ageMs = Date.now() - new Date(promotion.created_at).getTime();
  return promotion.confirmations_count >= HOT_DEAL_MIN_CONFIRMATIONS && ageMs <= HOT_DEAL_WINDOW_MS;
}

export function discountPercent(promotion: Pick<Promotion, 'price' | 'original_price'>): number {
  if (promotion.original_price <= 0) return 0;
  return Math.round((1 - promotion.price / promotion.original_price) * 100);
}
