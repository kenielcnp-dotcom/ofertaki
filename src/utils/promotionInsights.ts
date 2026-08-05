import type { Promotion } from '../types/promotion';

const HOUR_MS = 60 * 60 * 1000;

/** Duração máxima de exibição por tipo de promoção. `null` = usa `expires_at` direto (encarte). */
const TYPE_DURATION_MS: Record<string, number | null> = {
  relampago: 6 * HOUR_MS,
  comum: 48 * HOUR_MS,
  encarte: null,
};

export function durationForType(type: string): number | null {
  return type in TYPE_DURATION_MS ? TYPE_DURATION_MS[type] : TYPE_DURATION_MS.comum;
}

export type FreshnessTier = 'quente' | 'recente' | 'pode_existir' | 'antiga';

/**
 * Selo de queda gradual de relevância — função pura de tempo decorrido desde
 * a última confirmação ("Aproveitei essa oferta" renova o relógio), como
 * fração da duração máxima do tipo. `null` quando já passou do prazo (a
 * promoção deve sumir do feed, não só perder o selo).
 */
export function freshnessTier(
  promotion: Pick<Promotion, 'created_at' | 'last_confirmed_at' | 'promotion_type' | 'expires_at'>
): FreshnessTier | null {
  const anchor = new Date(promotion.last_confirmed_at ?? promotion.created_at).getTime();
  const elapsed = Date.now() - anchor;

  const fixedDuration = durationForType(promotion.promotion_type);
  const duration =
    fixedDuration ??
    (promotion.expires_at
      ? new Date(promotion.expires_at).getTime() - new Date(promotion.created_at).getTime()
      : null);

  if (!duration || duration <= 0) return null;

  const fraction = elapsed / duration;
  if (fraction >= 1) return null;
  if (fraction < 0.15) return 'quente';
  if (fraction < 0.4) return 'recente';
  if (fraction < 0.75) return 'pode_existir';
  return 'antiga';
}

export function discountPercent(promotion: Pick<Promotion, 'price' | 'original_price'>): number {
  if (promotion.original_price <= 0) return 0;
  return Math.round((1 - promotion.price / promotion.original_price) * 100);
}

/** Selo de qualidade da oferta, baseado no desconto — usado no card de preço do detalhe. */
export function qualityLabel(discount: number): string | null {
  if (discount >= 40) return 'Oferta excelente';
  if (discount >= 20) return 'Boa oferta';
  return null;
}
