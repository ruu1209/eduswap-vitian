import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

/** Extracts a human-readable message from an Axios/API error. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

/** Extracts the machine-readable error code (e.g. EMAIL_NOT_VERIFIED), if any. */
export function getApiErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return data?.code;
  }
  return undefined;
}
