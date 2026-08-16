import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { adminService } from '@/services/adminService';
import { getApiErrorMessage } from '@/utils/apiError';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, q],
    queryFn: () => adminService.users({ page, q: q.trim() || undefined }),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('User removed');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Users</h1>
      <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name..." />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Verified</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2">
                    <Badge variant={u.isVerified ? 'accent' : 'secondary'}>{u.isVerified ? 'Yes' : 'No'}</Badge>
                  </td>
                  <td className="px-4 py-2"><Badge variant="outline">{u.role}</Badge></td>
                  <td className="px-4 py-2 text-right">
                    {u.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.confirm(`Delete ${u.name}?`) && del.mutate(u.id)}
                        disabled={del.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
