import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/reportService';
import { REASON_LABELS } from '@/features/reports/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import type { ReportStatus } from '@/types';

const ALL = 'all';
const STATUSES: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

export function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, status],
    queryFn: () => reportService.list(status === ALL ? undefined : (status as ReportStatus), page),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: Exclude<ReportStatus, 'pending'> }) =>
      reportService.updateStatus(id, next),
    onSuccess: () => {
      toast.success('Report updated');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <div className="w-44">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data && data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((report) => (
            <div key={report.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {report.targetType}: {report.target?.title ?? report.target?.name ?? '(deleted)'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {REASON_LABELS[report.reason]}
                    {report.reporter && ` · by ${report.reporter.name}`}
                  </p>
                  {report.description && <p className="mt-1 text-sm">{report.description}</p>}
                </div>
                <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>{report.status}</Badge>
              </div>
              {report.status !== 'resolved' && report.status !== 'dismissed' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => update.mutate({ id: report.id, next: 'resolved' })} disabled={update.isPending}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: report.id, next: 'dismissed' })} disabled={update.isPending}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">No reports here.</p>
      )}

      {data && data.meta.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
