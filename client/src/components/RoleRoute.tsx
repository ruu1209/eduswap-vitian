import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { PageSpinner } from '@/components/PageSpinner';
import type { UserRole } from '@/types';

/** Gate for role-restricted routes (e.g. admin). */
export function RoleRoute({ allow }: { allow: UserRole }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== allow) return <Navigate to={ROUTES.HOME} replace />;
  return <Outlet />;
}
