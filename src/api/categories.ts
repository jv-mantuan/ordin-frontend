import client, { type ApiResponse } from './client'
import type { CategoryDto, CategoryRequest } from '../types/category'

export const categoriesApi = {
  getAll: () =>
    client.get<ApiResponse<CategoryDto[]>>('/v1/categories'),

  getById: (id: string) =>
    client.get<ApiResponse<CategoryDto>>(`/v1/categories/${id}`),

  create: (data: CategoryRequest) =>
    client.post<ApiResponse<CategoryDto>>('/v1/categories', data),

  update: (id: string, data: CategoryRequest) =>
    client.put<ApiResponse<CategoryDto>>(`/v1/categories/${id}`, data),

  delete: (id: string) =>
    client.delete(`/v1/categories/${id}`),
}
