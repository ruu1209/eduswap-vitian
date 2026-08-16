import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from './constants';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  isVerified: boolean;
}
export interface RefreshTokenPayload {
  sub: string;
}

const accessExpiry = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
const refreshExpiry = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: accessExpiry });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
