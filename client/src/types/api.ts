/** Mirrors the server success envelope. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

/** Mirrors the server error envelope. */
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[] | string> | unknown;
}
