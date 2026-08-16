import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Plus, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceCard } from '@/features/resources/ResourceCard';
import { resourceService } from '@/services/resourceService';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/utils/constants';
import { DEPARTMENTS, RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTERS } from '@/utils/academic';
import type { Department, ResourceType, Semester } from '@/utils/academic';
import type { ResourceListParams } from '@/types';

const ALL = 'all';

export function ResourcesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 400);
  const [department, setDepartment] = useState<string>(ALL);
  const [semester, setSemester] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');

  useEffect(() => setPage(1), [q]);

  const params: ResourceListParams = {
    q: q.trim() || undefined,
    page,
    limit: 12,
    sort,
    department: department === ALL ? undefined : (department as Department),
    semester: semester === ALL ? undefined : (Number(semester) as Semester),
    type: type === ALL ? undefined : (type as ResourceType),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['resources', params],
    queryFn: () => resourceService.list(params),
    placeholderData: keepPreviousData,
  });

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Browse resources</h1>
          <p className="text-sm text-muted-foreground">Notes, PDFs and assignments shared by students.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.RESOURCE_UPLOAD}>
            <Plus className="h-4 w-4" /> Upload
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, subject, course code, tags or uploader..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          value={department}
          onValueChange={(v) => {
            setDepartment(v);
            resetToFirstPage();
          }}
        >
          <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={semester}
          onValueChange={(v) => {
            setSemester(v);
            resetToFirstPage();
          }}
        >
          <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All semesters</SelectItem>
            {SEMESTERS.map((s) => (
              <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(v) => {
            setType(v);
            resetToFirstPage();
          }}
        >
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as 'recent' | 'popular')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-muted-foreground">Couldn't load resources. Try again.</p>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.meta.page} of {Math.max(data.meta.pages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No resources match these filters</p>
          <p className="text-sm text-muted-foreground">Be the first to share something for this selection.</p>
          <Button className="mt-4" asChild>
            <Link to={ROUTES.RESOURCE_UPLOAD}>Upload a resource</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
