import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

const router = Router();

const dbStates: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized',
};

/** GET /api/v1/health — liveness + dependency status for uptime checks. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      message: 'EduSwap API is healthy',
      data: {
        status: 'ok',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        database: dbStates[mongoose.connection.readyState] ?? 'unknown',
      },
    });
  }),
);

export default router;
