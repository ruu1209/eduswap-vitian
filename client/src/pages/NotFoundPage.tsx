import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button className="mt-6" asChild>
        <Link to={ROUTES.HOME}>Back home</Link>
      </Button>
    </div>
  );
}
