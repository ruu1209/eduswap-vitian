import { z } from 'zod';

export const BOOK_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;

export const sellBookSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  author: z.string().max(160).optional().or(z.literal('')),
  description: z.string().max(4000).optional().or(z.literal('')),
  subject: z.string().max(120).optional().or(z.literal('')),
  edition: z.string().max(40).optional().or(z.literal('')),
  courseCode: z.string().max(20).optional().or(z.literal('')),
  condition: z.enum(BOOK_CONDITIONS, { message: 'Select a condition' }),
  price: z.coerce.number().min(0, 'Price cannot be negative').max(100000),
  isNegotiable: z.boolean().default(true),
});
export type SellBookValues = z.infer<typeof sellBookSchema>;
