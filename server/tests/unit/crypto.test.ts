import { describe, it, expect } from 'vitest';
import { sha256, generateOtp, generateToken } from '../../src/utils/crypto';

describe('crypto utils', () => {
  it('sha256 is deterministic', () => {
    expect(sha256('hello')).toBe(sha256('hello'));
    expect(sha256('a')).not.toBe(sha256('b'));
  });

  it('generateOtp returns 6 digits', () => {
    for (let i = 0; i < 20; i += 1) expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it('generateToken returns a hex string of expected length', () => {
    expect(generateToken(16)).toMatch(/^[a-f0-9]{32}$/);
  });
});
