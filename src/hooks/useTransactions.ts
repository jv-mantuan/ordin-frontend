import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import { localTimeZone, monthRange } from '../lib/month'
import type { TransactionFilters, TransactionRequest } from '../types/transaction'

const KEY = ['transactions']

/** Cursor-paginated list; filters are part of the key, so changing them starts a fresh list. */
export const useTransactionsInfinite = (filters: TransactionFilters) =>
  useInfiniteQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: ({ pageParam }) => transactionsApi.getPage({ ...filters, cursor: pageParam }).then((r) => r.data.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

/** Totals for the local calendar month of `month`, computed by the API. */
export const useTransactionsSummary = (month: Date) => {
  const { from, to } = monthRange(month)
  const timeZone = localTimeZone()
  return useQuery({
    queryKey: [...KEY, 'summary', from, to, timeZone],
    queryFn: () => transactionsApi.summary({ from, to, timeZone }).then((r) => r.data.data),
  })
}

/** The latest `limit` transactions of the local month of `month`. */
export const useRecentTransactions = (month: Date, limit = 5) => {
  const { from, to } = monthRange(month)
  return useQuery({
    queryKey: [...KEY, 'recent', from, to, limit],
    queryFn: () => transactionsApi.getPage({ from, to, limit }).then((r) => r.data.data.items),
  })
}

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: [...KEY, id],
    queryFn: () => transactionsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  })

/** Every mutation refreshes lists, summaries and the recent list (same key prefix). */
function useTransactionMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export const useCreateTransaction = () =>
  useTransactionMutation((data: TransactionRequest) => transactionsApi.create(data).then((r) => r.data.data))

export const useUpdateTransaction = () =>
  useTransactionMutation(({ id, data }: { id: string; data: TransactionRequest }) =>
    transactionsApi.update(id, data).then((r) => r.data.data),
  )

export const useDeleteTransaction = () => useTransactionMutation((id: string) => transactionsApi.delete(id))
