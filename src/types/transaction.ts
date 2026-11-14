/** 0 = Income, 1 = Expense */
export type TransactionType = 0 | 1

export interface TransactionDto {
  id?: string
  name: string
  amount: number
  type: TransactionType
  date: Date
  categoryId: string
  createdAt?: Date | string
}

export interface TransactionWithCategoryNameDto extends TransactionDto {
  categoryName: string | null
}

export interface TransactionFilters {
  type?: TransactionType
  /** ISO instant, inclusive. */
  from?: string
  /** ISO instant, exclusive. */
  to?: string
}

export interface TransactionsSummary {
  income: number
  expense: number
  balance: number
  /** Largest first. */
  expenseByCategory: { categoryId: string; categoryName: string; total: number }[]
  /** Local days "YYYY-MM-DD", oldest first. */
  expenseByDay: { day: string; total: number }[]
}

export interface TransactionRequest {
  name: string
  amount: number
  type: TransactionType
  date: Date
  categoryId: string
}
