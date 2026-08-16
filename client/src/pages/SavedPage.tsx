import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { ResourceCard } from '@/features/resources/ResourceCard';
import { BookCard } from '@/features/books/BookCard';
import { bookmarkService } from '@/services/bookmarkService';
import type { Book, BookmarkKind, Resource } from '@/types';

const TABS: { kind: BookmarkKind; label: string; icon: typeof Bookmark }[] = [
  { kind: 'bookmark', label: 'Bookmarks', icon: Bookmark },
  { kind: 'wishlist', label: 'Wishlist', icon: Heart },
];

export function SavedPage() {
  const [kind, setKind] = useState<BookmarkKind>('bookmark');

  const { data: items, isLoading } = useQuery({
    queryKey: ['bookmarks', kind],
    queryFn: () => bookmarkService.list(kind),
  });

  const visible = (items ?? []).filter((i) => i.target !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Saved</h1>
        <p className="text-sm text-muted-foreground">Your bookmarked resources and wishlisted books.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(({ kind: k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors',
              kind === k ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-secondary',
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) =>
            item.targetType === 'Resource' ? (
              <ResourceCard key={item.id} resource={item.target as Resource} />
            ) : (
              <BookCard key={item.id} book={item.target as Book} />
            ),
          )}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          Nothing here yet. Tap {kind === 'wishlist' ? 'Wishlist' : 'Save'} on any item to keep it here.
        </p>
      )}
    </div>
  );
}
