import { apiClient } from './apiClient';
import type { AdminStats, AdminUser, ApiSuccess, Book, PaginationMeta, Paginated, Resource } from '@/types';

interface ListParams {
  page: number;
  q?: string;
}

async function paged<T>(path: string, params: ListParams): Promise<Paginated<T>> {
  const { data } = await apiClient.get<ApiSuccess<T[]>>(path, { params: { ...params, limit: 20 } });
  return { items: data.data, meta: data.meta as unknown as PaginationMeta };
}

export const adminService = {
  async stats(): Promise<AdminStats> {
    const { data } = await apiClient.get<ApiSuccess<AdminStats>>('/admin/stats');
    return data.data;
  },
  users: (params: ListParams) => paged<AdminUser>('/admin/users', params),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
  resources: (params: ListParams) => paged<Resource>('/admin/resources', params),
  deleteResource: (id: string) => apiClient.delete(`/admin/resources/${id}`),
  books: (params: ListParams) => paged<Book>('/admin/books', params),
  deleteBook: (id: string) => apiClient.delete(`/admin/books/${id}`),
};
