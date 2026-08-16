import type { AxiosProgressEvent } from 'axios';
import { apiClient } from './apiClient';
import type { ApiSuccess, PaginationMeta, Paginated, Resource, ResourceListParams } from '@/types';

export interface CreateResourceInput {
  title: string;
  description: string;
  subject: string;
  department: string;
  semester: number;
  type: string;
  courseCode?: string;
  tags?: string[];
  isFree: boolean;
  price: number;
  file?: File;
  images: File[];
}

export const resourceService = {
  async list(params: ResourceListParams): Promise<Paginated<Resource>> {
    const { data } = await apiClient.get<ApiSuccess<Resource[]>>('/resources', { params });
    return { items: data.data, meta: data.meta as unknown as PaginationMeta };
  },

  async getById(id: string): Promise<Resource> {
    const { data } = await apiClient.get<ApiSuccess<Resource>>(`/resources/${id}`);
    return data.data;
  },

  async mine(): Promise<Resource[]> {
    const { data } = await apiClient.get<ApiSuccess<Resource[]>>('/resources/mine');
    return data.data;
  },

  async create(
    input: CreateResourceInput,
    onProgress?: (percent: number) => void,
  ): Promise<Resource> {
    const form = new FormData();
    form.append('title', input.title);
    form.append('description', input.description);
    form.append('subject', input.subject);
    form.append('department', input.department);
    form.append('semester', String(input.semester));
    form.append('type', input.type);
    if (input.courseCode) form.append('courseCode', input.courseCode);
    if (input.tags?.length) form.append('tags', input.tags.join(','));
    form.append('isFree', String(input.isFree));
    form.append('price', String(input.price));
    if (input.file) form.append('file', input.file);
    input.images.forEach((img) => form.append('images', img));

    const { data } = await apiClient.post<ApiSuccess<Resource>>('/resources', form, {
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data.data;
  },

  async downloadUrl(id: string): Promise<string> {
    const { data } = await apiClient.get<ApiSuccess<{ url: string }>>(`/resources/${id}/download`);
    return data.data.url;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  },
};
