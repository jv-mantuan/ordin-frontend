import { z } from 'zod'

/** Neon Auth rejects shorter passwords (PASSWORD_TOO_SHORT). */
export const PASSWORD_MIN = 8

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(150, 'Nome muito longo'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(PASSWORD_MIN, `A senha deve ter ao menos ${PASSWORD_MIN} caracteres`),
})

export type SignupFormData = z.infer<typeof signupSchema>

/** 6-digit email code; spaces and dashes from a paste are ignored. */
export const codeSchema = z.object({
  code: z
    .string()
    .transform((s) => s.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\d{6}$/, 'Digite os 6 números do código.')),
})

export type CodeFormInput = z.input<typeof codeSchema>
export type CodeFormData = z.output<typeof codeSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = codeSchema
  .extend({
    password: z.string().min(PASSWORD_MIN, `A senha deve ter ao menos ${PASSWORD_MIN} caracteres`),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormInput = z.input<typeof resetPasswordSchema>
export type ResetPasswordFormData = z.output<typeof resetPasswordSchema>
