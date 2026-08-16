import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
  stack?: string;
}

interface MongoDuplicateError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is MongoDuplicateError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  );
}

/** Central error handler — the only place that formats error responses. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown;
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
    code = err.code;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.flatten().fieldErrors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${String(err.value)}`;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    message = `Duplicate value for ${field}`;
  } else if (err instanceof Error && err.name === 'MulterError') {
    statusCode = 400;
    const code = (err as Error & { code?: string }).code;
    message = code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 15 MB)' : `Upload error: ${err.message}`;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  if (statusCode >= 500) {
    logger.error('Unhandled error', err);
  }

  const body: ErrorResponse = { success: false, message };
  if (code) body.code = code;
  if (errors) body.errors = errors;
  if (env.NODE_ENV !== 'production' && err instanceof Error) body.stack = err.stack;

  res.status(statusCode).json(body);
}
