import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '../api/services'
import type { ServiceRequest } from '../types/service'

const KEY = ['services']

export const useServices = () =>
  useQuery({
    queryKey: KEY,
    queryFn: () => servicesApi.getAll().then((r) => r.data.data),
  })

/** Every service mutation refreshes the list, which also refreshes the metric cards. */
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

export const useCompleteServicesBatch = () =>
  useServiceMutation((ids: string[]) => servicesApi.completeBatch(ids).then((r) => r.data.data))
