import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bookmark, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { getApiErrorMessage } from '@/utils/apiError';
import { bookmarkService } from '@/services/bookmarkService';
import type { BookmarkKind, BookmarkTargetType } from '@/types';

interface SaveButtonProps {
  targetType: BookmarkTargetType;
  targetId: string;
  kind: BookmarkKind;
}

/** Toggles a bookmark or wishlist entry for any resource/book target. */
export function SaveButton({ targetType, targetId, kind }: SaveButtonProps) {
  const queryClient = useQueryClient();
  const statusKey = ['bookmark-status', kind, targetType, targetId];

  const { data: saved = false } = useQuery({
    queryKey: statusKey,
    queryFn: () => bookmarkService.check(targetType, targetId, kind),
  });

  const toggle = useMutation({
    mutationFn: () => bookmarkService.toggle(targetType, targetId, kind),
    onSuccess: (isSaved) => {
      queryClient.setQueryData(statusKey, isSaved);
      queryClient.invalidateQueries({ queryKey: ['bookmarks', kind] });
      toast.success(isSaved ? 'Added' : 'Removed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const Icon = kind === 'wishlist' ? Heart : Bookmark;
  const label = kind === 'wishlist' ? (saved ? 'Wishlisted' : 'Wishlist') : saved ? 'Saved' : 'Save';

  return (
    <Button variant={saved ? 'default' : 'outline'} size="sm" onClick={() => toggle.mutate()} disabled={toggle.isPending}>
      <Icon className={cn('h-4 w-4', saved && 'fill-current')} />
      {label}
    </Button>
  );
}
