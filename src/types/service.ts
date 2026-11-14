export type ServiceStatus = 'scheduled' | 'completed' | 'cancelled'

export interface ServiceDto {
  id: string
  name: string
  clientName: string | null
  /** "YYYY-MM-DD" — the day the service happens, no time zone. */
  date: string
  amount: number
  receivedAmount: number
  expenses: number
  notes: string | null
  status: ServiceStatus
  completedAt: string | null
  createdAt: string
}

export interface ServiceRequest {
  name: string
  clientName: string | null
  date: string
  amount: number
  receivedAmount: number
  expenses: number
  notes: string | null
}
