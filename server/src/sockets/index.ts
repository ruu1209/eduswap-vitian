import type { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { chatRepository } from '../repositories/chat.repository';
import { logger } from '../config/logger';

/** Authenticates the socket handshake and wires chat room events. */
export function registerSocketHandlers(io: SocketServer): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`); // personal room for notifications

    socket.on('chat:join', async (chatId: string) => {
      const chat = await chatRepository.findById(chatId);
      const isParticipant = chat?.participants.some((p) => p._id.toString() === userId);
      if (isParticipant) socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('typing', ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${chatId}`).emit('typing', { chatId, userId, isTyping });
    });

    socket.on('disconnect', () => {
      logger.debug(`socket disconnected: ${userId}`);
    });
  });
}
