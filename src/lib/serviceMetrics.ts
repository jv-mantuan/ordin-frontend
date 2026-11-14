export interface ServiceMetrics {
  total: number
  consolidated: number
  receivable: number
  expenses: number
  netForecast: number
}

/**
 * Card labels and tooltip copy. The numbers come from GET /v1/services/summary; keep this text in
 * sync with the formulas in the backend's ServicesService.summary.
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
