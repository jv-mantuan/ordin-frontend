import client, { type ApiResponse } from './client'
import type { Page, PageParams } from '../types/page'
import type {
  TransactionDto,
  TransactionFilters,
  TransactionRequest,
  TransactionsSummary,
  TransactionWithCategoryNameDto,
} from '../types/transaction'

export const transactionsApi = {
  getPage: (params: TransactionFilters & PageParams) =>
    client.get<ApiResponse<Page<TransactionWithCategoryNameDto>>>('/v1/transactions', { params }),

  summary: (params: { from: string; to: string; timeZone: string }) =>
    client.get<ApiResponse<TransactionsSummary>>('/v1/transactions/summary', { params }),

  getById: (id: string) =>
    client.get<ApiResponse<TransactionWithCategoryNameDto>>(`/v1/transactions/${id}`),

  create: (data: TransactionRequest) =>
    client.post<ApiResponse<TransactionDto>>('/v1/transactions', data),

  update: (id: string, data: TransactionRequest) =>
    client.put<ApiResponse<TransactionDto>>(`/v1/transactions/${id}`, data),

  delete: (id: string) =>
    client.delete(`/v1/transactions/${id}`),
}
