import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { adminService } from '@/services/adminService';
import { getApiErrorMessage } from '@/utils/apiError';

export function AdminResourcesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resources', page, q],
    queryFn: () => adminService.resources({ page, q: q.trim() || undefined }),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteResource(id),
    onSuccess: () => {
      toast.success('Resource removed');
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Resources</h1>
      <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title..." />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Uploader</th>
                <th className="px-4 py-2">Dept/Sem</th>
                <th className="px-4 py-2">Views</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-medium">{r.title}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.uploader?.name ?? '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.department} · S{r.semester}</td>
                  <td className="px-4 py-2">{r.views}</td>
                  <td className="px-4 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => window.confirm(`Delete "${r.title}"?`) && del.mutate(r.id)} disabled={del.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
