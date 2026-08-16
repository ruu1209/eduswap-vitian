import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { reportService } from '../services/report.service';

export const reportController = {
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await reportService.create(req.user.id, req.body);
    sendSuccess(res, { statusCode: 201, message: 'Report submitted. Thank you.' });
  }),

  list: asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query as unknown as {
      status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      page: number;
      limit: number;
    };
    const result = await reportService.list(status, page, limit);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const report = await reportService.updateStatus(req.params.id, req.body.status, req.user.id);
    sendSuccess(res, { message: 'Report updated', data: report });
  }),
};
