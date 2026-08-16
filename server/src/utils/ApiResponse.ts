import type { Response } from 'express';

interface SuccessPayload<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

/** Uniform success envelope: { success, message, data?, meta? }. */
export function sendSuccess<T>(res: Response, payload: SuccessPayload<T> = {}): Response {
  const { data, message = 'Success', statusCode = 200, meta } = payload;
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
}
