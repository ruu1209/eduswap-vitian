import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import type { UserRole } from '../utils/constants';

/** Verifies the Bearer access token and attaches req.user. */
export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw AppError.unauthorized('Authentication required');

  const token = header.slice('Bearer '.length);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }

  req.user = { id: payload.sub, role: payload.role, isVerified: payload.isVerified };
  next();
});

/** Restricts a route to the given role(s). Use after `authenticate`. */
export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };

/** Requires a verified college email. Guards marketplace routes (Phase 5+). */
export const requireVerified: RequestHandler = (req, _res, next) => {
  if (!req.user?.isVerified) {
    next(AppError.forbidden('Please verify your college email to continue'));
    return;
  }
  next();
};
