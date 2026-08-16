import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { bookPath } from '@/utils/constants';
import { formatPrice } from '@/utils/format';
import { CONDITION_LABELS, STATUS_LABELS } from '@/features/books/constants';
import type { Book } from '@/types';

export function BookCard({ book }: { book: Book }) {
  const cover = book.images[0]?.url;
  return (
    <Link
      to={bookPath(book.id)}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-[4/3] bg-secondary">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <BookMarked className="h-8 w-8" />
          </div>
        )}
        {book.status !== 'available' && (
          <span className="absolute left-2 top-2">
            <Badge variant="secondary">{STATUS_LABELS[book.status]}</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-medium leading-snug group-hover:text-primary">
          {book.title}
        </h3>
        {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-mono text-sm font-medium">{formatPrice(book.price)}</span>
          <Badge variant="outline">{CONDITION_LABELS[book.condition]}</Badge>
        </div>
      </div>
    </Link>
  );
}
