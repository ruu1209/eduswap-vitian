import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const startChatSchema = z
  .object({
    recipientId: objectId,
    resourceId: objectId.optional(),
    bookId: objectId.optional(),
  })
  .refine((v) => !(v.resourceId && v.bookId), {
    message: 'Provide a resource or a book context, not both',
  });

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
