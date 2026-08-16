import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { adminService } from '../services/admin.service';
import { resourceService } from '../services/resource.service';
import { bookService } from '../services/book.service';

export const adminController = {
  stats: asyncHandler(async (_req, res) => {
    const data = await adminService.stats();
    sendSuccess(res, { data });
  }),

  users: asyncHandler(async (req, res) => {
    const result = await adminService.listUsers(req.query as never);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await adminService.deleteUser(req.params.id, req.user.id);
    sendSuccess(res, { message: 'User removed' });
  }),

  resources: asyncHandler(async (req, res) => {
    const result = await adminService.listResources(req.query as never);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  deleteResource: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await resourceService.remove(req.params.id, req.user);
    sendSuccess(res, { message: 'Resource removed' });
  }),

  books: asyncHandler(async (req, res) => {
    const result = await adminService.listBooks(req.query as never);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  deleteBook: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await bookService.remove(req.params.id, req.user);
    sendSuccess(res, { message: 'Book removed' });
  }),
};
