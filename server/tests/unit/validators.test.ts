import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema } from '../../src/validators/auth.validator';
import { createResourceSchema, listResourceQuerySchema } from '../../src/validators/resource.validator';

describe('auth validators', () => {
  it('rejects weak passwords and personal emails', () => {
    const r = signupSchema.safeParse({ name: 'Al', email: 'a@gmail.com', password: 'weak' });
    expect(r.success).toBe(false);
  });

  it('accepts a valid college signup', () => {
    const r = signupSchema.safeParse({ name: 'Alice', email: 'alice@vit.ac.in', password: 'StrongPass1' });
    expect(r.success).toBe(true);
  });

  it('login requires a password', () => {
    expect(loginSchema.safeParse({ email: 'a@vit.ac.in', password: '' }).success).toBe(false);
  });
});

describe('resource validators', () => {
  it('coerces multipart string fields', () => {
    const r = createResourceSchema.safeParse({
      title: 'OS Notes', description: 'Full unit notes', subject: 'OS',
      department: 'CSE', semester: '4', type: 'notes', isFree: 'true', price: '0', tags: 'unit1, solved',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.semester).toBe(4);
      expect(r.data.isFree).toBe(true);
      expect(r.data.tags).toEqual(['unit1', 'solved']);
    }
  });

  it('caps the search query length', () => {
    expect(listResourceQuerySchema.safeParse({ q: 'x'.repeat(200) }).success).toBe(false);
  });
});
