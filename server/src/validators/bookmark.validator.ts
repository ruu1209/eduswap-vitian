import { z } from 'zod';
import { BOOKMARK_KINDS, BOOKMARK_TARGETS } from '../utils/enums';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const toggleBookmarkSchema = z.object({
  targetType: z.enum(BOOKMARK_TARGETS),
  target: objectId,
  kind: z.enum(BOOKMARK_KINDS).default('bookmark'),
});

export const checkBookmarkSchema = z.object({
  targetType: z.enum(BOOKMARK_TARGETS),
  target: objectId,
  kind: z.enum(BOOKMARK_KINDS).default('bookmark'),
});

export const listBookmarkSchema = z.object({
  kind: z.enum(BOOKMARK_KINDS).default('bookmark'),
  targetType: z.enum(BOOKMARK_TARGETS).optional(),
});
