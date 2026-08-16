import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, BookMarked, Check, Loader2, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { bookService } from '@/services/bookService';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { formatPrice, timeAgo } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { CONDITION_LABELS, STATUS_LABELS } from '@/features/books/constants';
import { SaveButton } from '@/components/SaveButton';
import { chatService } from '@/services/chatService';
import { ReportButton } from '@/components/ReportButton';
import { chatPath } from '@/utils/constants';

export function BookDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: book, isLoading, isError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookService.getById(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['book', id] });
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  const reserve = useMutation({
    mutationFn: () => bookService.reserve(id),
    onSuccess: () => { toast.success('Book reserved'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const cancel = useMutation({
    mutationFn: () => bookService.cancelReservation(id),
    onSuccess: () => { toast.success('Reservation cancelled'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const markSold = useMutation({
    mutationFn: () => bookService.markSold(id),
    onSuccess: () => { toast.success('Marked as sold'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: () => bookService.remove(id),
    onSuccess: () => {
      toast.success('Book removed');
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate(ROUTES.BOOKS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const startChat = useMutation({
    mutationFn: () => chatService.start({ recipientId: book!.seller.id, bookId: book!.id }),
    onSuccess: (chat) => navigate(chatPath(chat.id)),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not start chat')),
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  if (isError || !book) return <p className="py-16 text-center text-muted-foreground">Book not found.</p>;

  const isSeller = user?.id === book.seller.id;
  const isReserver = book.reservedBy?.id === user?.id;
  const busy = reserve.isPending || cancel.isPending || markSold.isPending || remove.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
            {book.images[0] ? (
              <img src={book.images[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <BookMarked className="h-10 w-10" />
              </div>
            )}
          </div>
          {book.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {book.images.slice(1).map((img) => (
                <img key={img.publicId} src={img.url} alt="" className="aspect-square w-full rounded-md border border-border object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={book.status === 'available' ? 'accent' : 'secondary'}>{STATUS_LABELS[book.status]}</Badge>
              <Badge variant="outline">{CONDITION_LABELS[book.condition]}</Badge>
            </div>
            <SaveButton targetType="Book" targetId={book.id} kind="wishlist" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight">{book.title}</h1>
            {book.author && <p className="text-muted-foreground">{book.author}</p>}
          </div>

          <p className="font-mono text-2xl font-medium">{formatPrice(book.price)}</p>
          {book.isNegotiable && <p className="text-sm text-muted-foreground">Negotiable · message the seller to discuss</p>}

          {book.description && <p className="whitespace-pre-line text-sm text-foreground/90">{book.description}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            {book.subject && <span>{book.subject}</span>}
            {book.department && <span>{book.department}</span>}
            {book.semester && <span>Sem {book.semester}</span>}
            {book.edition && <span>{book.edition} ed.</span>}
            {book.courseCode && <span>{book.courseCode}</span>}
          </div>

          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-medium">{book.seller.name}</p>
            <p className="text-muted-foreground">{book.seller.college ?? book.college} · listed {timeAgo(book.createdAt)}</p>
            {isSeller && book.status === 'reserved' && book.reservedBy && (
              <p className="mt-2 text-muted-foreground">Reserved by {book.reservedBy.name}</p>
            )}
          </div>

          {/* Buyer actions */}
          {!isSeller && (
            <Button variant="outline" className="w-full" onClick={() => startChat.mutate()} disabled={startChat.isPending || busy}>
              <MessageSquare className="h-4 w-4" /> Message seller {book.isNegotiable && '· negotiate'}
            </Button>
          )}
          {!isSeller && book.status === 'available' && (
            <Button className="w-full" onClick={() => reserve.mutate()} disabled={busy}>
              {reserve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookMarked className="h-4 w-4" />}
              Reserve this book
            </Button>
          )}
          {!isSeller && isReserver && book.status === 'reserved' && (
            <Button variant="outline" className="w-full" onClick={() => cancel.mutate()} disabled={busy}>
              <X className="h-4 w-4" /> Cancel my reservation
            </Button>
          )}

          {/* Seller actions */}
          {isSeller && book.status !== 'sold' && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => markSold.mutate()} disabled={busy}>
                <Check className="h-4 w-4" /> Mark as sold
              </Button>
              {book.status === 'reserved' && (
                <Button variant="outline" onClick={() => cancel.mutate()} disabled={busy}>
                  <X className="h-4 w-4" /> Cancel reservation
                </Button>
              )}
              <Button variant="outline" onClick={() => remove.mutate()} disabled={busy}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )}

          {!isSeller && <ReportButton targetType="Book" targetId={book.id} />}
        </div>
      </div>
    </div>
  );
}
