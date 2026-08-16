import type { Response } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = env.NODE_ENV === 'production';

/** Set the refresh token as an httpOnly cookie scoped to the auth routes. */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: SEVEN_DAYS_MS,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
  });
}
