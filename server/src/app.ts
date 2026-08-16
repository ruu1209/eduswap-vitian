import express, { type Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

import { env } from './config/env';
import { corsOptions } from './config/cors';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';

/**
 * Assembles a fully configured Express app WITHOUT binding a port,
 * so it can be imported directly into tests (Phase 13).
 */
export function createApp(): Application {
  const app = express();

  // Trust Render/Vercel proxy so rate-limit and secure cookies work correctly.
  app.set('trust proxy', 1);

  // Security headers + CORS allowlist
  app.use(helmet());
  app.use(cors(corsOptions));

  // Gzip responses
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // NoSQL-injection sanitization
  app.use(mongoSanitize());

  // Request logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Global rate limiting
  app.use('/api', apiRateLimiter);

  // Mounted API
  app.use('/api/v1', apiRoutes);

  // 404 + centralized error handling (must be registered last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
