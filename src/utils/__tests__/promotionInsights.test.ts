import { durationForType, freshnessTier, discountPercent, qualityLabel } from '../promotionInsights';

describe('durationForType', () => {
  it('relâmpago dura 6h', () => {
    expect(durationForType('relampago')).toBe(6 * 60 * 60 * 1000);
  });

  it('comum dura 48h', () => {
    expect(durationForType('comum')).toBe(48 * 60 * 60 * 1000);
  });

  it('encarte não tem duração fixa (usa expires_at)', () => {
    expect(durationForType('encarte')).toBeNull();
  });

  it('tipo desconhecido cai no padrão de comum', () => {
    expect(durationForType('qualquer-coisa')).toBe(48 * 60 * 60 * 1000);
  });
});

describe('freshnessTier', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('promoção comum recém publicada é quente', () => {
    expect(
      freshnessTier({
        created_at: '2026-08-02T11:55:00Z',
        last_confirmed_at: null,
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBe('quente');
  });

  it('promoção comum com ~20% do prazo decorrido é recente', () => {
    expect(
      freshnessTier({
        created_at: '2026-08-02T02:24:00Z', // ~9h36 atrás de 48h = 20%
        last_confirmed_at: null,
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBe('recente');
  });

  it('promoção comum na metade do prazo pode ainda estar disponível', () => {
    expect(
      freshnessTier({
        created_at: '2026-08-01T12:00:00Z', // 24h atrás de 48h = 50%
        last_confirmed_at: null,
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBe('pode_existir');
  });

  it('promoção comum perto do fim do prazo é antiga', () => {
    expect(
      freshnessTier({
        created_at: '2026-07-31T16:00:00Z', // 44h atrás de 48h = ~92%
        last_confirmed_at: null,
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBe('antiga');
  });

  it('promoção expirada não tem selo (deve sumir do feed)', () => {
    expect(
      freshnessTier({
        created_at: '2026-07-29T12:00:00Z', // 96h atrás, prazo é 48h
        last_confirmed_at: null,
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBeNull();
  });

  it('relâmpago usa janela de 6h, não 48h', () => {
    expect(
      freshnessTier({
        created_at: '2026-08-02T09:00:00Z', // 3h atrás = 50% de 6h
        last_confirmed_at: null,
        promotion_type: 'relampago',
        expires_at: null,
      })
    ).toBe('pode_existir');
  });

  it('confirmação recente reseta o relógio mesmo com created_at antigo', () => {
    expect(
      freshnessTier({
        created_at: '2026-07-25T12:00:00Z',
        last_confirmed_at: '2026-08-02T11:58:00Z',
        promotion_type: 'comum',
        expires_at: null,
      })
    ).toBe('quente');
  });

  it('encarte usa expires_at como prazo total', () => {
    expect(
      freshnessTier({
        created_at: '2026-08-01T12:00:00Z',
        last_confirmed_at: null,
        promotion_type: 'encarte',
        expires_at: '2026-08-03T12:00:00Z', // prazo de 48h, 24h decorridas = 50%
      })
    ).toBe('pode_existir');
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

describe('qualityLabel', () => {
  it('desconto alto é oferta excelente', () => {
    expect(qualityLabel(40)).toBe('Oferta excelente');
    expect(qualityLabel(55)).toBe('Oferta excelente');
  });

  it('desconto médio é boa oferta', () => {
    expect(qualityLabel(20)).toBe('Boa oferta');
    expect(qualityLabel(39)).toBe('Boa oferta');
  });

  it('desconto baixo não tem selo', () => {
    expect(qualityLabel(19)).toBeNull();
    expect(qualityLabel(0)).toBeNull();
  });
});
