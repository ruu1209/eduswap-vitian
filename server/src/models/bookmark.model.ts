import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import { BOOKMARK_KINDS, BOOKMARK_TARGETS, type BookmarkKind, type BookmarkTarget } from '../utils/enums';

export interface IBookmark {
  user: Types.ObjectId;
  targetType: BookmarkTarget; // 'Resource' | 'Book' (drives refPath)
  target: Types.ObjectId;
  kind: BookmarkKind; // 'bookmark' | 'wishlist'
  createdAt: Date;
  updatedAt: Date;
}

export type BookmarkDocument = HydratedDocument<IBookmark>;

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: BOOKMARK_TARGETS, required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    kind: { type: String, enum: BOOKMARK_KINDS, default: 'bookmark' },
  },
  baseSchemaOptions,
);

// A user can bookmark a given item once per kind.
bookmarkSchema.index({ user: 1, targetType: 1, target: 1, kind: 1 }, { unique: true });

export const Bookmark = model<IBookmark>('Bookmark', bookmarkSchema);
