import { io, type Socket } from 'socket.io-client';
import { tokenStore } from './tokenStore';

let socket: Socket | null = null;

/** Opens (or returns) the authenticated socket connection. */
export function connectSocket(): Socket {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token: tokenStore.get() },
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
