import { Link, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/PageSpinner';
import { BookOpen } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

/** Centered layout for auth screens (login, signup, password reset). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-4 py-12">
      <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="font-display text-2xl font-semibold tracking-tight">EduSwap</span>
      </Link>
      <div className="w-full max-w-md">
        <Suspense fallback={<PageSpinner />}><Outlet /></Suspense>
      </div>
    </div>
  );
}
