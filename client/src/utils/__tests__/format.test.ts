import { describe, it, expect } from 'vitest';
import { formatPrice, timeAgo } from '../format';

describe('formatPrice', () => {
  it('shows Free for zero or less', () => {
    expect(formatPrice(0)).toBe('Free');
    expect(formatPrice(-5)).toBe('Free');
  });
  it('formats INR amounts', () => {
    expect(formatPrice(1500)).toContain('1,500');
    expect(formatPrice(1500).startsWith('₹')).toBe(true);
  });
});

describe('timeAgo', () => {
  it('reports recent times as just now', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now');
  });
  it('reports days for older times', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe('3d ago');
  });
});
