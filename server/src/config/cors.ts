import type { CorsOptions } from 'cors';
import { env } from './env';

// Build the allowlist from CORS_ORIGINS (comma-separated) or fall back to CLIENT_URL.
const configured = env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
export const allowedOrigins: string[] = configured?.length ? configured : [env.CLIENT_URL];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow server-to-server / curl (no Origin header) and allowlisted browser origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};
