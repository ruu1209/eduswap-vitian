import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDropzone } from '@/components/FileDropzone';
import { resourceService } from '@/services/resourceService';
import { resourcePath } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import { DEPARTMENTS, RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTERS } from '@/utils/academic';
import { uploadResourceSchema, type UploadResourceValues } from '@/features/resources/schemas';

export function UploadResourcePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UploadResourceValues>({
    resolver: zodResolver(uploadResourceSchema),
    defaultValues: { isFree: true, price: 0 },
  });

  const isFree = watch('isFree');

  const mutation = useMutation({
    mutationFn: (values: UploadResourceValues) =>
      resourceService.create(
        {
          title: values.title,
          description: values.description,
          subject: values.subject,
          department: values.department,
          semester: values.semester,
          type: values.type,
          courseCode: values.courseCode || undefined,
          tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          isFree: values.isFree,
          price: values.isFree ? 0 : values.price,
          file: file ?? undefined,
          images,
        },
        setProgress,
      ),
    onSuccess: (resource) => {
      toast.success('Resource uploaded');
      navigate(resourcePath(resource.id));
    },
    onError: (err) => {
      setProgress(0);
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!file && images.length === 0) {
      toast.error('Add a PDF or at least one image');
      return;
    }
    mutation.mutate(values);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload a resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Title" htmlFor="title" error={errors.title?.message}>
              <Input id="title" {...register('title')} />
            </Field>

            <Field label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea id="description" {...register('description')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subject" htmlFor="subject" error={errors.subject?.message}>
                <Input id="subject" {...register('subject')} />
              </Field>
              <Field label="Course code (optional)" htmlFor="courseCode" error={errors.courseCode?.message}>
                <Input id="courseCode" placeholder="CS3001" {...register('courseCode')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Department" htmlFor="department" error={errors.department?.message}>
                <Controller
                  control={control}
                  name="department"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="department"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Semester" htmlFor="semester" error={errors.semester?.message}>
                <Controller
                  control={control}
                  name="semester"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="semester"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => (
                          <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Type" htmlFor="type" error={errors.type?.message}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {RESOURCE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field label="Tags (optional, comma-separated)" htmlFor="tags" error={errors.tags?.message}>
              <Input id="tags" placeholder="midterm, unit-1, solved" {...register('tags')} />
            </Field>

            <div className="flex items-center gap-4">
              <Controller
                control={control}
                name="isFree"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    Free resource
                  </label>
                )}
              />
              {!isFree && (
                <Field label="" htmlFor="price" error={errors.price?.message}>
                  <Input id="price" type="number" min={0} placeholder="Price (₹)" {...register('price')} />
                </Field>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FileDropzone accept="application/pdf" onFiles={(f) => setFile(f[0] ?? null)}>
                  <FileText className="mb-2 h-6 w-6" />
                  {file ? file.name : 'Drop a PDF or click to browse'}
                </FileDropzone>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Remove file
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <FileDropzone
                  accept="image/*"
                  multiple
                  onFiles={(f) => setImages((prev) => [...prev, ...f].slice(0, 5))}
                >
                  <ImagePlus className="mb-2 h-6 w-6" />
                  {images.length > 0 ? `${images.length} image(s) selected` : 'Add preview images (up to 5)'}
                </FileDropzone>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Clear images
                  </button>
                )}
              </div>
            </div>

            {mutation.isPending && progress > 0 && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish resource
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
