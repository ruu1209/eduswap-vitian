import type { FilterQuery } from 'mongoose';
import { reportRepository } from '../repositories/report.repository';
import { Resource } from '../models/resource.model';
import { Book } from '../models/book.model';
import { User } from '../models/user.model';
import type { IReport } from '../models/report.model';
import { AppError } from '../utils/AppError';
import type { ReportReason, ReportStatus, ReportTarget } from '../utils/enums';

interface CreateInput {
  targetType: ReportTarget;
  target: string;
  reason: ReportReason;
  description?: string;
}

async function assertTargetExists(targetType: ReportTarget, target: string): Promise<void> {
  const model = targetType === 'Resource' ? Resource : targetType === 'Book' ? Book : User;
  const found = await model.exists({ _id: target });
  if (!found) throw AppError.notFound(`${targetType} not found`);
}

export const reportService = {
  async create(reporterId: string, input: CreateInput) {
    await assertTargetExists(input.targetType, input.target);

    const already = await reportRepository.pendingExists(reporterId, input.targetType, input.target);
    if (already) throw AppError.conflict('You have already reported this');

    return reportRepository.create({ reporter: reporterId, ...input });
  },

  async list(status: ReportStatus | undefined, page: number, limit: number) {
    const filter: FilterQuery<IReport> = {};
    if (status) filter.status = status;
    const { items, total } = await reportRepository.list(filter, page, limit);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },

  async updateStatus(id: string, status: ReportStatus, adminId: string) {
    const updated = await reportRepository.updateStatus(id, status, adminId);
    if (!updated) throw AppError.notFound('Report not found');
    return updated;
  },
};
