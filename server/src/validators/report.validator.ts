import { z } from 'zod';
import { REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS } from '../utils/enums';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGETS),
  target: objectId,
  reason: z.enum(REPORT_REASONS),
  description: z.string().max(1000).optional(),
});

export const listReportQuerySchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Admins may move a report to any state except back to 'pending'.
export const updateReportSchema = z.object({
  status: z.enum(['reviewed', 'resolved', 'dismissed']),
});
