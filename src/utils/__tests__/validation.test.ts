import {
  signUpSchema,
  signInSchema,
  createPromotionSchema,
  commentSchema,
} from '../validation';

describe('signUpSchema', () => {
  it('aceita dados válidos', () => {
    expect(
      signUpSchema.safeParse({
        username: 'caio_dev',
        email: 'caio@exemplo.com',
        password: 'senha123',
      }).success,
    ).toBe(true);
  });

  it('rejeita username curto ou com caracteres inválidos', () => {
    expect(
      signUpSchema.safeParse({
        username: 'ab',
        email: 'caio@exemplo.com',
        password: 'senha123',
      }).success,
    ).toBe(false);

    expect(
      signUpSchema.safeParse({
        username: 'Caio Dev!',
        email: 'caio@exemplo.com',
        password: 'senha123',
      }).success,
    ).toBe(false);
  });

  it('rejeita email inválido e senha curta', () => {
    expect(
      signUpSchema.safeParse({
        username: 'caio_dev',
        email: 'nao-e-email',
        password: 'senha123',
      }).success,
    ).toBe(false);

    expect(
      signUpSchema.safeParse({
        username: 'caio_dev',
        email: 'caio@exemplo.com',
        password: '123',
      }).success,
    ).toBe(false);
  });
});

describe('signInSchema', () => {
  it('exige email válido e senha não vazia', () => {
    expect(
      signInSchema.safeParse({ email: 'caio@exemplo.com', password: 'x' })
        .success,
    ).toBe(true);

    expect(
      signInSchema.safeParse({ email: 'invalido', password: 'x' }).success,
    ).toBe(false);

    expect(
      signInSchema.safeParse({ email: 'caio@exemplo.com', password: '' })
        .success,
    ).toBe(false);
  });
});

describe('createPromotionSchema', () => {
  const base = {
    title: 'Arroz 5kg',
    description: 'Promoção da semana',
    price: '19.9',
    originalPrice: '29.9',
    marketId: 'c3dbf9b1-2e34-4a56-8f7a-9b1c2d3e4f50',
    departmentId: 'd4ec0ac2-3f45-5b67-908b-0c2d3e4f5a61',
    imageUri: 'file:///tmp/arroz.jpg',
  };

  it('aceita promoção válida (coerce de string para número)', () => {
    const result = createPromotionSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(19.9);
      expect(result.data.originalPrice).toBe(29.9);
    }
  });

  it('rejeita quando o valor sem promoção é menor que o preço', () => {
    const result = createPromotionSchema.safeParse({
      ...base,
      price: '29.9',
      originalPrice: '19.9',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('originalPrice');
    }
  });

  it('rejeita campos obrigatórios ausentes', () => {
    expect(
      createPromotionSchema.safeParse({ ...base, title: 'ab' }).success,
    ).toBe(false);
    expect(
      createPromotionSchema.safeParse({ ...base, imageUri: '' }).success,
    ).toBe(false);
    expect(
      createPromotionSchema.safeParse({ ...base, marketId: 'nao-uuid' })
        .success,
    ).toBe(false);
  });
});

describe('commentSchema', () => {
  it('aceita comentário não vazio e rejeita vazio', () => {
    expect(commentSchema.safeParse({ body: 'Boa oferta!' }).success).toBe(true);
    expect(commentSchema.safeParse({ body: '' }).success).toBe(false);
  });
});
