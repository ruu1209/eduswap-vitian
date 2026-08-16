import { apiClient } from './apiClient';
import type { ApiSuccess, BookmarkKind, BookmarkTargetType, SavedItem } from '@/types';

export const bookmarkService = {
  async check(targetType: BookmarkTargetType, target: string, kind: BookmarkKind): Promise<boolean> {
    const { data } = await apiClient.get<ApiSuccess<{ saved: boolean }>>('/bookmarks/check', {
      params: { targetType, target, kind },
    });
    return data.data.saved;
  },

  async toggle(targetType: BookmarkTargetType, target: string, kind: BookmarkKind): Promise<boolean> {
    const { data } = await apiClient.post<ApiSuccess<{ saved: boolean }>>('/bookmarks/toggle', {
      targetType,
      target,
      kind,
    });
    return data.data.saved;
  },

  async list(kind: BookmarkKind, targetType?: BookmarkTargetType): Promise<SavedItem[]> {
    const { data } = await apiClient.get<ApiSuccess<SavedItem[]>>('/bookmarks', {
      params: { kind, ...(targetType ? { targetType } : {}) },
    });
    return data.data;
  },
};
