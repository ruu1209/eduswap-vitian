import type { UserRole } from '../utils/constants';

/**
 * Augments Express's Request with the authenticated user.
 * Populated by the auth middleware in Phase 4.
 */
declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: UserRole;
      isVerified: boolean;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
