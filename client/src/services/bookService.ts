import type { AxiosProgressEvent } from 'axios';
import { apiClient } from './apiClient';
import type { ApiSuccess, Book, BookListParams, PaginationMeta, Paginated } from '@/types';

export interface CreateBookInput {
  title: string;
  author?: string;
  description?: string;
  subject?: string;
  department?: string;
  semester?: number;
  courseCode?: string;
  edition?: string;
  condition: string;
  price: number;
  isNegotiable: boolean;
  images: File[];
}

export const bookService = {
  async list(params: BookListParams): Promise<Paginated<Book>> {
    const { data } = await apiClient.get<ApiSuccess<Book[]>>('/books', { params });
    return { items: data.data, meta: data.meta as unknown as PaginationMeta };
  },

  async getById(id: string): Promise<Book> {
    const { data } = await apiClient.get<ApiSuccess<Book>>(`/books/${id}`);
    return data.data;
  },

  async mine(): Promise<Book[]> {
    const { data } = await apiClient.get<ApiSuccess<Book[]>>('/books/mine');
    return data.data;
  },

  async create(input: CreateBookInput, onProgress?: (percent: number) => void): Promise<Book> {
    const form = new FormData();
    form.append('title', input.title);
    if (input.author) form.append('author', input.author);
    if (input.description) form.append('description', input.description);
    if (input.subject) form.append('subject', input.subject);
    if (input.department) form.append('department', input.department);
    if (input.semester) form.append('semester', String(input.semester));
    if (input.courseCode) form.append('courseCode', input.courseCode);
    if (input.edition) form.append('edition', input.edition);
    form.append('condition', input.condition);
    form.append('price', String(input.price));
    form.append('isNegotiable', String(input.isNegotiable));
    input.images.forEach((img) => form.append('images', img));

    const { data } = await apiClient.post<ApiSuccess<Book>>('/books', form, {
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data.data;
  },

  async reserve(id: string): Promise<Book> {
    const { data } = await apiClient.post<ApiSuccess<Book>>(`/books/${id}/reserve`);
    return data.data;
  },

  async cancelReservation(id: string): Promise<Book> {
    const { data } = await apiClient.post<ApiSuccess<Book>>(`/books/${id}/cancel-reservation`);
    return data.data;
  },

  async markSold(id: string): Promise<Book> {
    const { data } = await apiClient.post<ApiSuccess<Book>>(`/books/${id}/mark-sold`);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },
};
