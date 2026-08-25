import type { Server } from "socket.io";

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

export function getIo(): Server | null {
  return io;
}

export function emitToUsers(clientId: string, lawyerId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`user:${clientId}`).to(`user:${lawyerId}`).emit(event, payload);
}
