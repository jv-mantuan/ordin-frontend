import { z } from 'zod'

export const RECEIVED_ABOVE_AMOUNT = 'O valor recebido não pode ser maior que o valor do serviço'

const money = (label: string) =>
  z
    .number({ error: `${label} inválido` })
    .refine(Number.isFinite, `${label} inválido`)
    .refine((n) => n >= 0, `${label} não pode ser negativo`)

/** Validates the service form after the pt-BR money strings were parsed (blank optional amounts → 0). */
export const serviceSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo (máx. 200 caracteres)'),
    clientName: z.string().max(150, 'Cliente muito longo (máx. 150 caracteres)'),
    date: z.string().min(1, 'Data é obrigatória'),
    amount: money('Valor'),
    receivedAmount: money('Valor recebido'),
    expenses: money('Gastos'),
    notes: z.string().max(2000, 'Anotações muito longas (máx. 2000 caracteres)'),
  })
  .refine((s) => s.receivedAmount <= s.amount, { message: RECEIVED_ABOVE_AMOUNT, path: ['receivedAmount'] })

export type ServiceFormData = z.infer<typeof serviceSchema>
