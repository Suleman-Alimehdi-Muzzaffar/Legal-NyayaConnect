import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string | null): Socket | null {
  if (!token) return null;
  if (socket?.connected && (socket.auth as { token?: string })?.token === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  const url = import.meta.env.VITE_API_URL || window.location.origin.replace(":5173", ":8080");
  const base = import.meta.env.PROD ? window.location.origin : url;
  socket = io(base, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
