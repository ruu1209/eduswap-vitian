import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Download, Eye, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { resourceService } from '@/services/resourceService';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { formatPrice, timeAgo } from '@/utils/format';
import { RESOURCE_TYPE_LABELS } from '@/utils/academic';
import { SaveButton } from '@/components/SaveButton';
import { chatService } from '@/services/chatService';
import { ReportButton } from '@/components/ReportButton';
import { chatPath } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';

export function ResourceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const { data: resource, isLoading, isError } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourceService.getById(id),
    enabled: Boolean(id),
  });

  const removeMutation = useMutation({
    mutationFn: () => resourceService.remove(id),
    onSuccess: () => {
      toast.success('Resource deleted');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      navigate(ROUTES.RESOURCES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const startChat = useMutation({
    mutationFn: () =>
      chatService.start({ recipientId: resource!.uploader.id, resourceId: resource!.id }),
    onSuccess: (chat) => navigate(chatPath(chat.id)),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not start chat')),
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = await resourceService.downloadUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Download failed'));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (isError || !resource) {
    return <p className="py-16 text-center text-muted-foreground">Resource not found.</p>;
  }

  const isOwner = user?.id === resource.uploader.id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
            <Badge variant={resource.isFree ? 'accent' : 'default'}>{formatPrice(resource.price)}</Badge>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">{resource.title}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {resource.subject} · {resource.department} · Sem {resource.semester}
            {resource.courseCode && ` · ${resource.courseCode}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isOwner && (
            <Button variant="outline" size="sm" onClick={() => startChat.mutate()} disabled={startChat.isPending}>
              <MessageSquare className="h-4 w-4" /> Message
            </Button>
          )}
          <SaveButton targetType="Resource" targetId={resource.id} kind="bookmark" />
          <SaveButton targetType="Resource" targetId={resource.id} kind="wishlist" />
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {resource.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {resource.images.map((img) => (
            <img
              key={img.publicId}
              src={img.url}
              alt=""
              className="aspect-[3/4] w-full rounded-md border border-border object-cover"
            />
          ))}
        </div>
      )}

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{resource.description}</p>

      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline">#{tag}</Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="text-sm">
          <p className="font-medium">{resource.uploader.name}</p>
          <p className="text-muted-foreground">{resource.uploader.college ?? resource.college}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {resource.views}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {resource.downloads}
          </span>
          <span>{timeAgo(resource.createdAt)}</span>
        </div>
      </div>

      {resource.file && (
        <Button className="w-full" size="lg" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download {resource.isFree ? '' : `· ${formatPrice(resource.price)}`}
        </Button>
      )}

      {!isOwner && <ReportButton targetType="Resource" targetId={resource.id} />}
    </div>
  );
}
