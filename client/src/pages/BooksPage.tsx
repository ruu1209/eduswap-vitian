import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BookPlus, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCard } from '@/features/books/BookCard';
import { BOOK_CONDITIONS, CONDITION_LABELS, STATUS_LABELS } from '@/features/books/constants';
import { bookService } from '@/services/bookService';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/utils/constants';
import type { BookCondition, BookListParams, BookStatus } from '@/types';

const ALL = 'all';

export function BooksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 400);
  const [condition, setCondition] = useState<string>(ALL);
  const [status, setStatus] = useState<BookStatus>('available');
  const [sort, setSort] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  useEffect(() => setPage(1), [q]);

  const params: BookListParams = {
    q: q.trim() || undefined,
    page,
    limit: 12,
    sort,
    status,
    condition: condition === ALL ? undefined : (condition as BookCondition),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', params],
    queryFn: () => bookService.list(params),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Book marketplace</h1>
          <p className="text-sm text-muted-foreground">Buy and sell used academic books on campus.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.BOOK_SELL}>
            <BookPlus className="h-4 w-4" /> Sell a book
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, course code or seller..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Select value={condition} onValueChange={(v) => { setCondition(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any condition</SelectItem>
            {BOOK_CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v as BookStatus); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['available', 'reserved', 'sold'] as BookStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-muted-foreground">Couldn't load books. Try again.</p>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.meta.page} of {Math.max(data.meta.pages, 1)}
            </span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No books here yet</p>
          <p className="text-sm text-muted-foreground">List one you've finished with.</p>
          <Button className="mt-4" asChild>
            <Link to={ROUTES.BOOK_SELL}>Sell a book</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
