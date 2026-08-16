import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/db';
import { configureCloudinary } from './config/cloudinary';
import { initSocket } from './sockets/io';
import { allowedOrigins } from './config/cors';
import { registerSocketHandlers } from './sockets';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  configureCloudinary();

  const app = createApp();
  const httpServer = createServer(app);

  // Real-time chat (Phase 11).
  const io = initSocket(httpServer, allowedOrigins);
  registerSocketHandlers(io);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string): void => {
    logger.warn(`${signal} received — shutting down gracefully`);
    httpServer.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
    // Hard-exit if graceful shutdown stalls.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Fatal error during startup', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});
