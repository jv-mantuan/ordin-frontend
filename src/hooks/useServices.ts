import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '../api/services'
import type { DateRange } from '../lib/period'
import type { ServiceRequest, ServiceStatus } from '../types/service'

const KEY = ['services']

/** Cursor-paginated list; the filters are part of the key, so changing them starts a fresh list. */
export const useServicesInfinite = (status?: ServiceStatus, range: DateRange = {}) =>
  useInfiniteQuery({
    queryKey: [...KEY, 'list', { status, ...range }],
    queryFn: ({ pageParam }) =>
      servicesApi.getPage({ status, ...range, cursor: pageParam }).then((r) => r.data.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

/** Metric cards for the period (all services when empty) + today's scheduled count, computed by the API. */
export const useServicesSummary = (today: string, range: DateRange = {}) =>
  useQuery({
    queryKey: [...KEY, 'summary', today, range],
    queryFn: () => servicesApi.summary(today, range).then((r) => r.data.data),
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
