/** Shared academic + domain vocabulary. Single source of truth for all models. */

export const DEPARTMENTS = [
  'CSE',
  'IT',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'CHEM',
  'BIOTECH',
  'AIDS',
  'MBA',
  'OTHER',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Semester = (typeof SEMESTERS)[number];

export const RESOURCE_TYPES = ['notes', 'pdf', 'assignment', 'slides', 'other'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const BOOK_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;
export type BookCondition = (typeof BOOK_CONDITIONS)[number];

export const BOOK_STATUSES = ['available', 'reserved', 'sold'] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOKMARK_KINDS = ['bookmark', 'wishlist'] as const;
export type BookmarkKind = (typeof BOOKMARK_KINDS)[number];

/** Model names used by dynamic (refPath) references. */
export const BOOKMARK_TARGETS = ['Resource', 'Book'] as const;
export type BookmarkTarget = (typeof BOOKMARK_TARGETS)[number];

export const REVIEW_TARGETS = ['Resource', 'User'] as const;
export type ReviewTarget = (typeof REVIEW_TARGETS)[number];

export const REPORT_TARGETS = ['Resource', 'Book', 'User'] as const;
export type ReportTarget = (typeof REPORT_TARGETS)[number];

export const REPORT_REASONS = [
  'spam',
  'inappropriate',
  'copyright',
  'misleading',
  'harassment',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  'message',
  'bookmark',
  'review',
  'report_update',
  'book_reserved',
  'book_sold',
  'system',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
