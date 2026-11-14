import { todayISO } from './date'

export type PeriodPreset = 'all' | 'thisMonth' | 'next30' | 'lastMonth' | 'custom'

export interface Period {
  preset: PeriodPreset
  /** Only used by 'custom': "YYYY-MM-DD" or ''. */
  from: string
  to: string
}

/** A date-only range for the API; both ends inclusive, either may be missing. */
export interface DateRange {
  from?: string
  to?: string
}

export const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'all', label: 'Todo o período' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'next30', label: 'Próximos 30 dias' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
]

export const REVERSED_PERIOD_MESSAGE = 'A data inicial precisa ser antes da final.'

/**
 * The range to send for a period, in the browser's local calendar. Returns null when the custom
 * period is reversed (not applied; the UI explains why).
 */
export function periodRange(period: Period, now: Date = new Date()): DateRange | null {
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (period.preset) {
    case 'all':
      return {}
    case 'thisMonth':
      return { from: todayISO(new Date(y, m, 1)), to: todayISO(new Date(y, m + 1, 0)) }
    case 'lastMonth':
      return { from: todayISO(new Date(y, m - 1, 1)), to: todayISO(new Date(y, m, 0)) }
    case 'next30':
      return { from: todayISO(now), to: todayISO(new Date(y, m, now.getDate() + 30)) }
    case 'custom': {
      const from = period.from || undefined
      const to = period.to || undefined
      if (from && to && from > to) return null
      return { from, to }
    }
  }
}
