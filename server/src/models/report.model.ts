import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import {
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGETS,
  type ReportReason,
  type ReportStatus,
  type ReportTarget,
} from '../utils/enums';

export interface IReport {
  reporter: Types.ObjectId;
  targetType: ReportTarget; // 'Resource' | 'Book' | 'User'
  target: Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  resolvedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportDocument = HydratedDocument<IReport>;

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: REPORT_TARGETS, required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: REPORT_STATUSES, default: 'pending', index: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  baseSchemaOptions,
);

reportSchema.index({ targetType: 1, target: 1 });
reportSchema.index({ createdAt: -1 });

export const Report = model<IReport>('Report', reportSchema);
