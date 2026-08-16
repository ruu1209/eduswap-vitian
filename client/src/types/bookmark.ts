import type { Resource } from './resource';
import type { Book } from './book';

export type BookmarkKind = 'bookmark' | 'wishlist';
export type BookmarkTargetType = 'Resource' | 'Book';

export interface SavedItem {
  id: string;
  kind: BookmarkKind;
  targetType: BookmarkTargetType;
  target: Resource | Book | null;
  createdAt: string;
}
