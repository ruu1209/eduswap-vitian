import { Types } from 'mongoose';
import { Bookmark, type IBookmark } from '../models/bookmark.model';
import type { BookmarkKind, BookmarkTarget } from '../utils/enums';

export interface BookmarkKey {
  user: string;
  targetType: BookmarkTarget;
  target: string;
  kind: BookmarkKind;
}

export const bookmarkRepository = {
  findOne(key: BookmarkKey) {
    return Bookmark.findOne(key);
  },

  create(key: BookmarkKey) {
    const data: Partial<IBookmark> = {
      user: new Types.ObjectId(key.user),
      targetType: key.targetType,
      target: new Types.ObjectId(key.target),
      kind: key.kind,
    };
    return Bookmark.create(data);
  },

  deleteById(id: string) {
    return Bookmark.findByIdAndDelete(id);
  },

  exists(key: BookmarkKey) {
    return Bookmark.exists(key);
  },

  listByUser(user: string, kind: BookmarkKind, targetType?: BookmarkTarget) {
    const filter: Record<string, unknown> = { user, kind };
    if (targetType) filter.targetType = targetType;
    return Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        // refPath resolves Resource or Book; nested populate fills the owner.
        path: 'target',
        populate: [
          { path: 'uploader', select: 'name college avatarUrl' },
          { path: 'seller', select: 'name college avatarUrl' },
        ],
      });
  },
};
