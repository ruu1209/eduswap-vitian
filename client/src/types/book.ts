import type { Department, Semester } from '@/utils/academic';
import type { StoredFile } from './resource';

export type BookCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type BookStatus = 'available' | 'reserved' | 'sold';

export interface BookSeller {
  id: string;
  name: string;
  college?: string;
  avatarUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  subject?: string;
  department?: Department;
  semester?: Semester;
  courseCode?: string;
  edition?: string;
  condition: BookCondition;
  price: number;
  isNegotiable: boolean;
  images: StoredFile[];
  seller: BookSeller;
  college: string;
  status: BookStatus;
  reservedBy?: { id: string; name: string } | null;
  createdAt: string;
}

export interface BookListParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'price_asc' | 'price_desc';
  department?: Department;
  condition?: BookCondition;
  status?: BookStatus;
  maxPrice?: number;
}
