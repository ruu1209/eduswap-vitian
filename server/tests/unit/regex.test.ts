import { describe, it, expect } from 'vitest';
import { escapeRegExp, buildSearchRegex } from '../../src/utils/regex';

describe('regex utils', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('.*+?')).toBe('\\.\\*\\+\\?');
  });

  it('matches literally, not as a wildcard', () => {
    const rx = buildSearchRegex('C++ (data)');
    expect(rx.test('Intro to C++ (data) structures')).toBe(true);
    expect(rx.test('Cxx data')).toBe(false);
  });
});
