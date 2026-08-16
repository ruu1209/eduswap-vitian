import { bookmarkRepository } from '../repositories/bookmark.repository';
import { resourceRepository } from '../repositories/resource.repository';
import { Resource } from '../models/resource.model';
import { Book } from '../models/book.model';
import { AppError } from '../utils/AppError';
import type { BookmarkKind, BookmarkTarget } from '../utils/enums';

interface ToggleInput {
  targetType: BookmarkTarget;
  target: string;
  kind: BookmarkKind;
}

async function assertTargetExists(targetType: BookmarkTarget, target: string): Promise<void> {
  const model = targetType === 'Resource' ? Resource : Book;
  const found = await model.exists({ _id: target, isActive: true });
  if (!found) throw AppError.notFound(`${targetType} not found`);
}

export const bookmarkService = {
  async toggle(userId: string, input: ToggleInput): Promise<{ saved: boolean }> {
    await assertTargetExists(input.targetType, input.target);

    const key = { user: userId, targetType: input.targetType, target: input.target, kind: input.kind };
    const existing = await bookmarkRepository.findOne(key);

    if (existing) {
      await bookmarkRepository.deleteById(existing._id.toString());
      if (input.kind === 'bookmark' && input.targetType === 'Resource') {
        await resourceRepository.adjustBookmarkCount(input.target, -1);
      }
      return { saved: false };
    }

    await bookmarkRepository.create(key);
    if (input.kind === 'bookmark' && input.targetType === 'Resource') {
      await resourceRepository.adjustBookmarkCount(input.target, 1);
    }
    return { saved: true };
  },

  async check(userId: string, input: ToggleInput): Promise<{ saved: boolean }> {
    const found = await bookmarkRepository.exists({
      user: userId,
      targetType: input.targetType,
      target: input.target,
      kind: input.kind,
    });
    return { saved: Boolean(found) };
  },

  list(userId: string, kind: BookmarkKind, targetType?: BookmarkTarget) {
    return bookmarkRepository.listByUser(userId, kind, targetType);
  },
};
