import type { Department, ResourceType, Semester } from '@/utils/academic';

export interface StoredFile {
  url: string;
  publicId: string;
}

export interface ResourceUploader {
  id: string;
  name: string;
  college?: string;
  avatarUrl?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  department: Department;
  semester: Semester;
  courseCode?: string;
  type: ResourceType;
  tags: string[];
  isFree: boolean;
  price: number;
  file?: StoredFile;
  images: StoredFile[];
  uploader: ResourceUploader;
  college: string;
  views: number;
  downloads: number;
  bookmarksCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ResourceListParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'popular';
  department?: Department;
  semester?: Semester;
  type?: ResourceType;
  isFree?: boolean;
}
