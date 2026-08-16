import { z } from 'zod';
import { DEPARTMENTS, RESOURCE_TYPES } from '@/utils/academic';

export const uploadResourceSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(160),
  description: z.string().min(10, 'Add a longer description').max(4000),
  subject: z.string().min(2, 'Subject is required').max(120),
  department: z.enum(DEPARTMENTS, { message: 'Select a department' }),
  semester: z.coerce.number().int().min(1).max(8),
  type: z.enum(RESOURCE_TYPES, { message: 'Select a type' }),
  courseCode: z.string().max(20).optional().or(z.literal('')),
  tags: z.string().optional(),
  isFree: z.boolean().default(true),
  price: z.coerce.number().min(0).max(100000).default(0),
});
export type UploadResourceValues = z.infer<typeof uploadResourceSchema>;
