import client, { type ApiResponse } from './client'
import type { Page, PageParams } from '../types/page'
import type { ServiceDto, ServiceRequest, ServicesSummary, ServiceStatus } from '../types/service'

export const servicesApi = {
  getPage: (params: { status?: ServiceStatus } & PageParams) =>
    client.get<ApiResponse<Page<ServiceDto>>>('/v1/services', { params }),

  summary: (today: string) => client.get<ApiResponse<ServicesSummary>>('/v1/services/summary', { params: { today } }),

  getById: (id: string) => client.get<ApiResponse<ServiceDto>>(`/v1/services/${id}`),

  create: (data: ServiceRequest) => client.post<ApiResponse<ServiceDto>>('/v1/services', data),

  update: (id: string, data: ServiceRequest) => client.put<ApiResponse<ServiceDto>>(`/v1/services/${id}`, data),

  complete: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/complete`),

  cancel: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/cancel`),

  reopen: (id: string) => client.post<ApiResponse<ServiceDto>>(`/v1/services/${id}/reopen`),

  completeByDate: (date: string) =>
    client.post<ApiResponse<{ completed: number }>>('/v1/services/complete-by-date', { date }),
}
