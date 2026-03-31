import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import type { TransactionRequest } from '../types/transaction'

export const useTransactions = () =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll().then((r) => r.data.data),
  })

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  })

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TransactionRequest) =>
      transactionsApi.create(data).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) =>
      transactionsApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
