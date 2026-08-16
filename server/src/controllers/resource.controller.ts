import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { resourceService } from '../services/resource.service';

type MulterFiles = { file?: Express.Multer.File[]; images?: Express.Multer.File[] };

export const resourceController = {
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const resource = await resourceService.create(req.user.id, req.body, (req.files as MulterFiles) ?? {});
    sendSuccess(res, { statusCode: 201, message: 'Resource uploaded', data: resource });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await resourceService.list(req.query as never);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const resource = await resourceService.getById(req.params.id);
    sendSuccess(res, { data: resource });
  }),

  mine: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const items = await resourceService.listByUploader(req.user.id);
    sendSuccess(res, { data: items });
  }),

  download: asyncHandler(async (req, res) => {
    const result = await resourceService.download(req.params.id);
    sendSuccess(res, { data: result });
  }),

  remove: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await resourceService.remove(req.params.id, req.user);
    sendSuccess(res, { message: 'Resource deleted' });
  }),
};
