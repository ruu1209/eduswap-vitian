import request from 'supertest';
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app';

const app = createApp();
let mongod: MongoMemoryServer | undefined;
let dbReady = false;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    dbReady = true;
  } catch {
    // No network to download the Mongo binary (e.g. CI sandbox) — tests self-skip.
    dbReady = false;
  }
});

afterAll(async () => {
  if (dbReady) {
    await mongoose.disconnect();
    await mongod?.stop();
  }
});

describe('auth flow (in-memory Mongo)', () => {
  it('signup → verify OTP → login → me', async (ctx) => {
    if (!dbReady) return ctx.skip();

    const email = 'alice@vit.ac.in';
    const password = 'StrongPass1';

    const signup = await request(app).post('/api/v1/auth/signup').send({ name: 'Alice R', email, password });
    expect(signup.status).toBe(201);
    const devOtp = signup.body.data.devOtp as string;
    expect(devOtp).toMatch(/^\d{6}$/);

    // Login is blocked until the email is verified.
    const early = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(early.status).toBe(403);
    expect(early.body.code).toBe('EMAIL_NOT_VERIFIED');

    const verify = await request(app).post('/api/v1/auth/verify-otp').send({ email, otp: devOtp });
    expect(verify.status).toBe(200);
    const token = verify.body.data.accessToken as string;
    expect(token).toBeTruthy();

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.isVerified).toBe(true);

    // Login now succeeds.
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeTruthy();

    // Wrong password is rejected.
    const bad = await request(app).post('/api/v1/auth/login').send({ email, password: 'WrongPass1' });
    expect(bad.status).toBe(401);
  });

  it('rejects duplicate verified signups', async (ctx) => {
    if (!dbReady) return ctx.skip();
    // alice already exists & verified from the previous test
    const dup = await request(app)
      .post('/api/v1/auth/signup')
      .send({ name: 'Alice Two', email: 'alice@vit.ac.in', password: 'StrongPass1' });
    expect(dup.status).toBe(409);
  });
});
