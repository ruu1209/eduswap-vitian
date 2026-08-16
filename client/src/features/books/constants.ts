import type { BookCondition, BookStatus } from '@/types';

export const BOOK_CONDITIONS: BookCondition[] = ['new', 'like_new', 'good', 'fair', 'poor'];

export const CONDITION_LABELS: Record<BookCondition, string> = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const STATUS_LABELS: Record<BookStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
};
