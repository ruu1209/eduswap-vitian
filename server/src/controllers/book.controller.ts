import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { bookService } from '../services/book.service';

type MulterFiles = { images?: Express.Multer.File[] };

export const bookController = {
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const book = await bookService.create(req.user.id, req.body, (req.files as MulterFiles) ?? {});
    sendSuccess(res, { statusCode: 201, message: 'Book listed', data: book });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await bookService.list(req.query as never);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const book = await bookService.getById(req.params.id);
    sendSuccess(res, { data: book });
  }),

  mine: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const items = await bookService.listBySeller(req.user.id);
    sendSuccess(res, { data: items });
  }),

  reserve: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const book = await bookService.reserve(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Book reserved', data: book });
  }),

  cancelReservation: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const book = await bookService.cancelReservation(req.params.id, req.user);
    sendSuccess(res, { message: 'Reservation cancelled', data: book });
  }),

  markSold: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const book = await bookService.markSold(req.params.id, req.user);
    sendSuccess(res, { message: 'Book marked as sold', data: book });
  }),

  remove: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await bookService.remove(req.params.id, req.user);
    sendSuccess(res, { message: 'Book removed' });
  }),
};
