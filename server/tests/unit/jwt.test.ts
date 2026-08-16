import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../src/utils/jwt';

describe('jwt utils', () => {
  it('round-trips an access token', () => {
    const token = signAccessToken({ sub: 'u1', role: 'student', isVerified: true });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('u1');
    expect(payload.role).toBe('student');
    expect(payload.isVerified).toBe(true);
  });

  it('round-trips a refresh token', () => {
    const token = signRefreshToken({ sub: 'u2' });
    expect(verifyRefreshToken(token).sub).toBe('u2');
  });

  it('rejects a malformed token', () => {
    expect(() => verifyAccessToken('garbage')).toThrow();
  });
});
