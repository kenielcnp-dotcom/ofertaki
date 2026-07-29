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
