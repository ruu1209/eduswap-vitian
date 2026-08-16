import type { ReportReason } from '@/types';

export const REPORT_REASONS: ReportReason[] = [
  'spam',
  'inappropriate',
  'copyright',
  'misleading',
  'harassment',
  'other',
];

export const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  inappropriate: 'Inappropriate content',
  copyright: 'Copyright violation',
  misleading: 'Misleading',
  harassment: 'Harassment',
  other: 'Other',
};
