export type ReportReason = 'spam' | 'inappropriate' | 'copyright' | 'misleading' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportTargetType = 'Resource' | 'Book' | 'User';

export interface ReportItem {
  id: string;
  reporter?: { id: string; name: string; email: string };
  targetType: ReportTargetType;
  target: { id?: string; title?: string; name?: string } | null;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
}
