import { Suspense, type ReactNode } from 'react';
import { PageSpinner } from '@/components/PageSpinner';

/** Wraps a lazy element in a Suspense boundary with the standard spinner. */
export function SuspenseRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}
