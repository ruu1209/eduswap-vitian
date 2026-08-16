import { z } from 'zod';
import { DEPARTMENTS, RESOURCE_TYPES } from '../utils/enums';

// Multipart form fields arrive as strings, so we coerce/parse deliberately.
const toBool = (v: unknown) => (typeof v === 'string' ? v === 'true' || v === '1' : Boolean(v));
const parseTags = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* not JSON — fall through to comma split */
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export const createResourceSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(160),
  description: z.string().min(10, 'Add a longer description').max(4000),
  subject: z.string().min(2).max(120),
  department: z.enum(DEPARTMENTS),
  semester: z.coerce.number().int().min(1).max(8),
  type: z.enum(RESOURCE_TYPES),
  courseCode: z.string().max(20).optional(),
  tags: z.preprocess(parseTags, z.array(z.string()).max(10)).optional(),
  isFree: z.preprocess(toBool, z.boolean()).default(true),
  price: z.coerce.number().min(0).max(100000).default(0),
});

export const listResourceQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(['recent', 'popular']).default('recent'),
  department: z.enum(DEPARTMENTS).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  type: z.enum(RESOURCE_TYPES).optional(),
  isFree: z.preprocess((v) => (v === undefined ? undefined : toBool(v)), z.boolean().optional()),
  uploader: z.string().optional(),
});
