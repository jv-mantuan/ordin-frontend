import type { ServiceDto } from '../types/service'

export interface ServiceMetrics {
  total: number
  consolidated: number
  receivable: number
  expenses: number
  netForecast: number
}

/**
 * Card labels and tooltip copy. Kept next to computeServiceMetrics so the
 * explanation never drifts from the formula.
 */
export const SERVICE_METRIC_INFO: Record<keyof ServiceMetrics, { label: string; info: string }> = {
  total: {
    label: 'Faturamento total',
    info: 'Soma do valor de todos os serviços agendados e concluídos. Serviços cancelados não entram.',
  },
  consolidated: {
    label: 'Faturamento consolidado',
    info: 'Soma do valor dos serviços que você já marcou como concluídos.',
  },
  receivable: {
    label: 'A receber',
    info: 'Quanto ainda falta receber dos clientes: o valor de cada serviço menos o que já foi pago adiantado.',
  },
  expenses: {
    label: 'Despesas previstas',
    info: 'Soma dos gastos lançados nos serviços agendados e concluídos.',
  },
  netForecast: {
    label: 'Faturamento líquido previsto',
    info: 'O que sobra quando tudo for recebido e todos os gastos forem pagos: faturamento total menos despesas previstas. Pode ficar negativo.',
  },
}

const cents = (x: number) => Math.round(x * 100) / 100

/** All metrics ignore cancelled services. */
export function computeServiceMetrics(services: ServiceDto[]): ServiceMetrics {
  let total = 0
  let consolidated = 0
  let receivable = 0
  let expenses = 0

  for (const s of services) {
    if (s.status === 'cancelled') continue
    total += s.amount
    expenses += s.expenses
    receivable += Math.max(s.amount - s.receivedAmount, 0)
    if (s.status === 'completed') consolidated += s.amount
  }

  return {
    total: cents(total),
    consolidated: cents(consolidated),
    receivable: cents(receivable),
    expenses: cents(expenses),
    netForecast: cents(total - expenses),
  }
}
