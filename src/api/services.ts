import client, { type ApiResponse } from './client'
import type { ServiceDto, ServiceRequest } from '../types/service'

export const servicesApi = {
  getAll: () => client.get<ApiResponse<ServiceDto[]>>('/v1/services'),

  getById: (id: string) => client.get<ApiResponse<ServiceDto>>(`/v1/services/${id}`),

  create: (data: ServiceRequest) => client.post<ApiResponse<ServiceDto>>('/v1/services', data),

  update: (id: string, data: ServiceRequest) => client.put<ApiResponse<ServiceDto>>(`/v1/services/${id}`, data),

  complete: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/complete`),

  cancel: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/cancel`),

  reopen: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/reopen`),

  completeBatch: (ids: string[]) =>
    client.post<ApiResponse<ServiceDto[]>>('/v1/services/complete-batch', { ids }),
}
