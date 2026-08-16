import { describe, it, expect } from 'vitest';
import { isBlockedEmailDomain, getEmailDomain } from '../../src/utils/email';

describe('email domain checks', () => {
  it('extracts the domain', () => {
    expect(getEmailDomain('alice@VIT.ac.in')).toBe('vit.ac.in');
  });

  it('blocks personal providers', () => {
    expect(isBlockedEmailDomain('a@gmail.com')).toBe(true);
    expect(isBlockedEmailDomain('a@yahoo.com')).toBe(true);
  });

  it('allows college domains', () => {
    expect(isBlockedEmailDomain('a@vit.ac.in')).toBe(false);
  });
});
