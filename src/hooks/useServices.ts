import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '../api/services'
import type { ServiceRequest, ServiceStatus } from '../types/service'

const KEY = ['services']

/** Cursor-paginated list; the status filter is part of the key, so changing it starts a fresh list. */
export const useServicesInfinite = (status?: ServiceStatus) =>
  useInfiniteQuery({
    queryKey: [...KEY, 'list', { status }],
    queryFn: ({ pageParam }) => servicesApi.getPage({ status, cursor: pageParam }).then((r) => r.data.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

/** Metric cards + today's scheduled count, computed by the API over every service. */
export const useServicesSummary = (today: string) =>
  useQuery({
    queryKey: [...KEY, 'summary', today],
    queryFn: () => servicesApi.summary(today).then((r) => r.data.data),
  })

/** Every service mutation refreshes lists and summary (same key prefix). */
function useServiceMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export const useCreateService = () =>
  useServiceMutation((data: ServiceRequest) => servicesApi.create(data).then((r) => r.data.data))

export const useUpdateService = () =>
  useServiceMutation(({ id, data }: { id: string; data: ServiceRequest }) =>
    servicesApi.update(id, data).then((r) => r.data.data),
  )

export const useCompleteService = () =>
  useServiceMutation((id: string) => servicesApi.complete(id).then((r) => r.data.data))

export const useCancelService = () =>
  useServiceMutation((id: string) => servicesApi.cancel(id).then((r) => r.data.data))

export const useReopenService = () =>
  useServiceMutation((id: string) => servicesApi.reopen(id).then((r) => r.data.data))

export const useCompleteServicesByDate = () =>
  useServiceMutation((date: string) => servicesApi.completeByDate(date).then((r) => r.data.data))
