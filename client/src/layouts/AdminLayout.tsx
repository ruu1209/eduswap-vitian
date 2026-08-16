import { NavLink, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/PageSpinner';
import { LayoutDashboard, Users, FileWarning, Boxes } from 'lucide-react';
import { cn } from '@/utils/cn';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/resources', label: 'Resources', icon: Boxes },
  { to: '/admin/reports', label: 'Reports', icon: FileWarning },
];

/** Two-column admin shell with a sidebar. Guarded by RoleRoute upstream. */
export function AdminLayout() {
  return (
    <div className="container grid min-h-screen grid-cols-1 gap-8 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="mb-3 font-display text-lg font-medium">Admin</p>
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary',
              )
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </aside>
      <section>
        <Suspense fallback={<PageSpinner />}><Outlet /></Suspense>
      </section>
    </div>
  );
}
