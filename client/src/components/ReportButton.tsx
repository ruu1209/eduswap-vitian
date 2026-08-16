import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/reportService';
import { getApiErrorMessage } from '@/utils/apiError';
import { REPORT_REASONS, REASON_LABELS } from '@/features/reports/constants';
import type { ReportReason, ReportTargetType } from '@/types';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
}

/** Inline report control — expands to a small reason form, no modal needed. */
export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');

  const submit = useMutation({
    mutationFn: () => reportService.create({ targetType, target: targetId, reason, description: description || undefined }),
    onSuccess: () => {
      toast.success('Report submitted. Thank you.');
      setOpen(false);
      setDescription('');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-muted-foreground">
        <Flag className="h-4 w-4" /> Report
      </Button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium">Report this {targetType.toLowerCase()}</p>
      <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {REPORT_REASONS.map((r) => (
            <SelectItem key={r} value={r}>{REASON_LABELS[r]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details (optional)"
        className="min-h-[64px]"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => submit.mutate()} disabled={submit.isPending}>
          Submit report
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
