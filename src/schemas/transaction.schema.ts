import { z } from 'zod'

export const transactionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.union([z.literal(0), z.literal(1)]),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
