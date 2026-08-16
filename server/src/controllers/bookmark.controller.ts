import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { bookmarkService } from '../services/bookmark.service';

export const bookmarkController = {
  toggle: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const result = await bookmarkService.toggle(req.user.id, req.body);
    sendSuccess(res, { message: result.saved ? 'Saved' : 'Removed', data: result });
  }),

  check: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const result = await bookmarkService.check(req.user.id, req.query as never);
    sendSuccess(res, { data: result });
  }),

  list: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const { kind, targetType } = req.query as { kind: 'bookmark' | 'wishlist'; targetType?: 'Resource' | 'Book' };
    const items = await bookmarkService.list(req.user.id, kind, targetType);
    sendSuccess(res, { data: items });
  }),
};
