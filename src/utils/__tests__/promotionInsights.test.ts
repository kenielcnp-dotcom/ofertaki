import { isHotDeal, discountPercent } from '../promotionInsights';

describe('isHotDeal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retorna true para promoção com 10+ confirmações publicada há pouco', () => {
    expect(
      isHotDeal({
        confirmations_count: 10,
        created_at: '2026-08-02T11:00:00Z',
      }),
    ).toBe(true);
  });

  it('retorna true exatamente no limiar da janela de 24h', () => {
    expect(
      isHotDeal({
        confirmations_count: 15,
        created_at: '2026-08-01T12:00:00Z',
      }),
    ).toBe(true);
  });

  it('retorna false quando passa de 24h, mesmo com muitas confirmações', () => {
    expect(
      isHotDeal({
        confirmations_count: 40,
        created_at: '2026-08-01T11:59:00Z',
      }),
    ).toBe(false);
  });

  it('retorna false com poucas confirmações, mesmo recente', () => {
    expect(
      isHotDeal({
        confirmations_count: 9,
        created_at: '2026-08-02T11:59:00Z',
      }),
    ).toBe(false);
  });
});

describe('discountPercent', () => {
  it('calcula o percentual arredondado', () => {
    expect(
      discountPercent({ price: 7.5, original_price: 10 }),
    ).toBe(25);
  });

  it('arredonda para cima no meio', () => {
    // 1 - 5/8 = 0.375 → Math.round(37.5) = 38
    expect(discountPercent({ price: 5, original_price: 8 })).toBe(38);
  });

  it('retorna 0 quando não há preço original', () => {
    expect(discountPercent({ price: 5, original_price: 0 })).toBe(0);
    expect(discountPercent({ price: 5, original_price: -1 })).toBe(0);
  });

  it('retorna 0 quando o preço é igual ao original', () => {
    expect(discountPercent({ price: 9.9, original_price: 9.9 })).toBe(0);
  });
});
