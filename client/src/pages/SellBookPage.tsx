import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDropzone } from '@/components/FileDropzone';
import { bookService } from '@/services/bookService';
import { bookPath } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/apiError';
import { DEPARTMENTS, SEMESTERS } from '@/utils/academic';
import { BOOK_CONDITIONS, CONDITION_LABELS } from '@/features/books/constants';
import { sellBookSchema, type SellBookValues } from '@/features/books/schemas';

const UNSPECIFIED = 'unspecified';

export function SellBookPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [department, setDepartment] = useState<string>(UNSPECIFIED);
  const [semester, setSemester] = useState<string>(UNSPECIFIED);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SellBookValues>({
    resolver: zodResolver(sellBookSchema),
    defaultValues: { isNegotiable: true },
  });

  const mutation = useMutation({
    mutationFn: (values: SellBookValues) =>
      bookService.create(
        {
          title: values.title,
          author: values.author || undefined,
          description: values.description || undefined,
          subject: values.subject || undefined,
          edition: values.edition || undefined,
          courseCode: values.courseCode || undefined,
          department: department === UNSPECIFIED ? undefined : department,
          semester: semester === UNSPECIFIED ? undefined : Number(semester),
          condition: values.condition,
          price: values.price,
          isNegotiable: values.isNegotiable,
          images,
        },
        setProgress,
      ),
    onSuccess: (book) => {
      toast.success('Book listed');
      navigate(bookPath(book.id));
    },
    onError: (err) => {
      setProgress(0);
      toast.error(getApiErrorMessage(err, 'Could not list book'));
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (images.length === 0) {
      toast.error('Add at least one photo');
      return;
    }
    mutation.mutate(values);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Sell a book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Title" htmlFor="title" error={errors.title?.message}>
              <Input id="title" {...register('title')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author (optional)" htmlFor="author" error={errors.author?.message}>
                <Input id="author" {...register('author')} />
              </Field>
              <Field label="Edition (optional)" htmlFor="edition" error={errors.edition?.message}>
                <Input id="edition" placeholder="3rd" {...register('edition')} />
              </Field>
            </div>

            <Field label="Description (optional)" htmlFor="description" error={errors.description?.message}>
              <Textarea id="description" placeholder="Any highlighting, missing pages, etc." {...register('description')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subject (optional)" htmlFor="subject" error={errors.subject?.message}>
                <Input id="subject" {...register('subject')} />
              </Field>
              <Field label="Course code (optional)" htmlFor="courseCode" error={errors.courseCode?.message}>
                <Input id="courseCode" placeholder="CS3001" {...register('courseCode')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Department" htmlFor="department">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSPECIFIED}>Unspecified</SelectItem>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Semester" htmlFor="semester">
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSPECIFIED}>Unspecified</SelectItem>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Condition" htmlFor="condition" error={errors.condition?.message}>
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="condition"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {BOOK_CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (₹)" htmlFor="price" error={errors.price?.message}>
                <Input id="price" type="number" min={0} {...register('price')} />
              </Field>
              <Controller
                control={control}
                name="isNegotiable"
                render={({ field }) => (
                  <label className="flex items-center gap-2 pt-8 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    Price is negotiable
                  </label>
                )}
              />
            </div>

            <div className="space-y-2">
              <FileDropzone accept="image/*" multiple onFiles={(f) => setImages((prev) => [...prev, ...f].slice(0, 5))}>
                <ImagePlus className="mb-2 h-6 w-6" />
                {images.length > 0 ? `${images.length} photo(s) selected` : 'Add photos of the book (up to 5)'}
              </FileDropzone>
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" /> Clear photos
                </button>
              )}
            </div>

            {mutation.isPending && progress > 0 && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              List book
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
