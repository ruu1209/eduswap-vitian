/**
 * Operational error with an HTTP status. Anything thrown as an AppError is
 * treated as a known, safe-to-expose failure by the error middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, details?: unknown, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, details);
  }
  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }
  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }
  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }
  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }
  static emailNotVerified(message = 'Please verify your college email to continue'): AppError {
    return new AppError(message, 403, undefined, 'EMAIL_NOT_VERIFIED');
  }
}
