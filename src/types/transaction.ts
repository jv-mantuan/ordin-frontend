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

export interface TransactionRequest {
  name: string
  amount: number
  type: TransactionType
  date: Date
  categoryId: string
}
