import { z } from 'zod';
import { BOOK_CONDITIONS, DEPARTMENTS } from '../utils/enums';

const toBool = (v: unknown) => (typeof v === 'string' ? v === 'true' || v === '1' : Boolean(v));

export const createBookSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  author: z.string().max(160).optional(),
  description: z.string().max(4000).optional(),
  subject: z.string().max(120).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  courseCode: z.string().max(20).optional(),
  edition: z.string().max(40).optional(),
  condition: z.enum(BOOK_CONDITIONS),
  price: z.coerce.number().min(0).max(100000),
  isNegotiable: z.preprocess(toBool, z.boolean()).default(true),
});

export const updateBookSchema = createBookSchema.partial();

export const listBookQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(['recent', 'price_asc', 'price_desc']).default('recent'),
  department: z.enum(DEPARTMENTS).optional(),
  condition: z.enum(BOOK_CONDITIONS).optional(),
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
  maxPrice: z.coerce.number().min(0).optional(),
  seller: z.string().optional(),
});
