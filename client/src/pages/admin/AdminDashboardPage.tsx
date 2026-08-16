import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, FileText, FileWarning } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/adminService';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminService.stats() });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Overview</h1>

      {isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Users" value={stats.users} />
          <Stat label="Verified users" value={stats.verifiedUsers} />
          <Stat label="Resources" value={stats.resources} />
          <Stat label="Books" value={stats.books} />
          <Stat label="Books sold" value={stats.booksSold} />
          <Stat label="Pending reports" value={stats.pendingReports} />
          <Stat label="Total reports" value={stats.totalReports} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/admin/users', label: 'Manage users', icon: Users },
          { to: '/admin/resources', label: 'Manage resources', icon: FileText },
          { to: '/admin/reports', label: 'Review reports', icon: FileWarning },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/40">
            <Icon className="h-5 w-5 text-primary" /> <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
