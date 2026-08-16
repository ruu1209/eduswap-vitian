import { Link } from 'react-router-dom';
import { Eye, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { resourcePath } from '@/utils/constants';
import { formatPrice, timeAgo } from '@/utils/format';
import { RESOURCE_TYPE_LABELS } from '@/utils/academic';
import type { Resource } from '@/types';

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      to={resourcePath(resource.id)}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge variant="secondary">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
        <Badge variant={resource.isFree ? 'accent' : 'default'}>{formatPrice(resource.price)}</Badge>
      </div>

      <h3 className="font-display text-lg font-medium leading-snug group-hover:text-primary">
        {resource.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs text-muted-foreground">
        <span>{resource.subject}</span>
        <span>·</span>
        <span>{resource.department}</span>
        <span>·</span>
        <span>Sem {resource.semester}</span>
        {resource.courseCode && <span>· {resource.courseCode}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> {resource.uploader.name}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {resource.views}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> {resource.downloads}
          </span>
          <span>{timeAgo(resource.createdAt)}</span>
        </span>
      </div>
    </Link>
  );
}
