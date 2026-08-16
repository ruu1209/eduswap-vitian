import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';

let io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer, origin: string | string[]): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin, credentials: true },
  });
  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitToChat(chatId: string, event: string, payload: unknown): void {
  io?.to(`chat:${chatId}`).emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}
