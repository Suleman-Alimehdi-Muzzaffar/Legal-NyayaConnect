import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { initDb } from "./db";
import { verifyToken } from "./lib/token";
import { createMessage, findUserById } from "./data/store";
import { setIo } from "./lib/io";
import { startCron } from "./lib/cron";

// Local-first default: Replit workflows inject PORT, but plain
// `npm run dev` should work on localhost without it.
const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  await initDb();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:5173", credentials: true },
  });
  setIo(io);

  io.use(async (socket, next) => {
    const token = (socket.handshake.auth?.token as string | undefined) ?? (socket.handshake.query?.token as string | undefined);
    const userId = token ? verifyToken(String(token)) : undefined;
    if (!userId) return next(new Error("unauthorized"));
    const user = await findUserById(userId);
    if (!user) return next(new Error("unauthorized"));
    (socket.data as Record<string, unknown>).user = user;
    (socket.data as Record<string, unknown>).userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const user = (socket.data as Record<string, unknown>).user as { id: string; role: string; name: string };
    const room = `user:${user.id}`;
    socket.join(room);
    logger.info({ userId: user.id, role: user.role }, "socket connected");

    socket.on("message:send", async (payload: { toId?: string; body?: string; lawyerId?: string; clientId?: string }, ack?: (res: unknown) => void) => {
      try {
        const body = typeof payload?.body === "string" ? payload.body.trim() : "";
        if (!body || body.length > 2000) {
          ack?.({ error: "invalid_payload" });
          return;
        }
        const targetId = (payload.lawyerId ?? payload.clientId ?? payload.toId ?? "") as string;
        if (!targetId) {
          ack?.({ error: "missing_recipient" });
          return;
        }
        const isLawyer = user.role === "lawyer";
        const clientId = isLawyer ? targetId : user.id;
        const lawyerId = isLawyer ? user.id : targetId;
        const msg = await createMessage({
          clientId,
          lawyerId,
          senderId: user.id,
          senderRole: user.role as "client" | "lawyer",
          senderName: user.name,
          body,
        });
        // emit to both participants
        io.to(`user:${clientId}`).to(`user:${lawyerId}`).emit("message:new", msg);
        ack?.({ ok: true, message: msg });
      } catch (err) {
        logger.error({ err }, "socket message send failed");
        ack?.({ error: "internal" });
      }
    });

    socket.on("disconnect", () => {
      logger.info({ userId: user.id }, "socket disconnected");
    });
  });

  startCron();
  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening (with socket.io)");
  });
  httpServer.on("error", (err: Error) => {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
