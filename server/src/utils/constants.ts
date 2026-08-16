export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Personal/free providers rejected at signup — enforced in Phase 5. */
export const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'live.com',
  'mail.com',
] as const;

export const API_PREFIX = '/api/v1';
