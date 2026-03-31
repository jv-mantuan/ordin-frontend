import client, { type ApiResponse } from './client'
import type { TransactionDto, TransactionRequest, TransactionWithCategoryNameDto } from '../types/transaction'

export const transactionsApi = {
  getAll: () =>
    client.get<ApiResponse<TransactionWithCategoryNameDto[]>>('/v1/transactions'),

  getById: (id: string) =>
    client.get<ApiResponse<TransactionWithCategoryNameDto>>(`/v1/transactions/${id}`),

  create: (data: TransactionRequest) =>
    client.post<ApiResponse<TransactionDto>>('/v1/transactions', data),

  update: (id: string, data: TransactionRequest) =>
    client.put<ApiResponse<TransactionDto>>(`/v1/transactions/${id}`, data),

  delete: (id: string) =>
    client.delete(`/v1/transactions/${id}`),
}
