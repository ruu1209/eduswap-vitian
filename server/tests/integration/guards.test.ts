import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/utils/jwt';

const app = createApp();
const student = signAccessToken({ sub: 'u1', role: 'student', isVerified: true });
const unverified = signAccessToken({ sub: 'u2', role: 'student', isVerified: false });
const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('route guards (no DB required)', () => {
  it('health check returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('unknown route returns 404 envelope', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('resources require authentication', async () => {
    expect((await request(app).get('/api/v1/resources')).status).toBe(401);
  });

  it('resources require a verified account', async () => {
    const res = await request(app).get('/api/v1/resources').set(bearer(unverified));
    expect(res.status).toBe(403);
  });

  it('admin routes require the admin role', async () => {
    const res = await request(app).get('/api/v1/admin/stats').set(bearer(student));
    expect(res.status).toBe(403);
  });

  it('signup rejects personal email domains', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'A B', email: 'a@gmail.com', password: 'StrongPass1' });
    expect(res.status).toBe(422);
  });

  it('login validation rejects a missing password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@vit.ac.in' });
    expect(res.status).toBe(422);
  });
});
