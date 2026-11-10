import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(150, 'Nome muito longo'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
})

export type SignupFormData = z.infer<typeof signupSchema>
