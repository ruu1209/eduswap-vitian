import crypto from 'node:crypto';

/** Random URL-safe token (hex). Used for password-reset links. */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** One-way hash for storing tokens at rest (never store raw tokens). */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** Numeric OTP of the given length. Used in Phase 5. */
export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, '0');
}
