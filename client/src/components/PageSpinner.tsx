import { Loader2 } from 'lucide-react';

/** Full-height centered spinner for route-level loading states. */
export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
