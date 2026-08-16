import { Types } from 'mongoose';
import { Report, type IReport } from '../models/report.model';
import type { FilterQuery } from 'mongoose';
import type { ReportStatus, ReportTarget } from '../utils/enums';

interface CreateReportInput {
  reporter: string;
  targetType: ReportTarget;
  target: string;
  reason: IReport['reason'];
  description?: string;
}

export const reportRepository = {
  create(data: CreateReportInput) {
    return Report.create({
      reporter: new Types.ObjectId(data.reporter),
      targetType: data.targetType,
      target: new Types.ObjectId(data.target),
      reason: data.reason,
      description: data.description,
    });
  },

  pendingExists(reporter: string, targetType: ReportTarget, target: string) {
    return Report.exists({ reporter, targetType, target, status: 'pending' });
  },

  async list(filter: FilterQuery<IReport>, page: number, limit: number) {
    const [items, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reporter', 'name email')
        .populate('target', 'title name'),
      Report.countDocuments(filter),
    ]);
    return { items, total };
  },

  updateStatus(id: string, status: ReportStatus, resolvedBy: string) {
    return Report.findByIdAndUpdate(
      id,
      { status, resolvedBy: new Types.ObjectId(resolvedBy) },
      { new: true },
    );
  },
};
