import { z } from 'zod';

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter ao menos 3 caracteres')
    .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Use apenas letras minúsculas, números e underscore'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const signInSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

export const createPromotionSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive('Informe um preço válido'),
  marketId: z.string().uuid('Selecione o mercado'),
  imageUri: z.string().min(1, 'A foto da promoção é obrigatória'),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

export const commentSchema = z.object({
  body: z.string().min(1, 'Escreva um comentário').max(500),
});

export type CommentInput = z.infer<typeof commentSchema>;
