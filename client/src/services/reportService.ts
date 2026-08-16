import { apiClient } from './apiClient';
import type { ApiSuccess, PaginationMeta, Paginated, ReportItem, ReportReason, ReportStatus, ReportTargetType } from '@/types';

export interface CreateReportInput {
  targetType: ReportTargetType;
  target: string;
  reason: ReportReason;
  description?: string;
}

export const reportService = {
  async create(input: CreateReportInput): Promise<void> {
    await apiClient.post('/reports', input);
  },

  async list(status: ReportStatus | undefined, page: number): Promise<Paginated<ReportItem>> {
    const { data } = await apiClient.get<ApiSuccess<ReportItem[]>>('/reports', {
      params: { ...(status ? { status } : {}), page, limit: 20 },
    });
    return { items: data.data, meta: data.meta as unknown as PaginationMeta };
  },

  async updateStatus(id: string, status: Exclude<ReportStatus, 'pending'>): Promise<void> {
    await apiClient.patch(`/reports/${id}`, { status });
  },
};
