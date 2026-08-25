import { Router, type IRouter } from "express";
import { verifyToken } from "../lib/token";
import {
  createMessage,
  findUserByEmail,
  findUserById,
  getClientConversations,
  getLawyerConversations,
  getMessagesBetween,
  markConversationRead,
} from "../data/store";
import { paramString } from "../lib/params";
import { emitToUsers } from "../lib/io";
import * as db from "@workspace/db";

const router: IRouter = Router();

const MAX_MESSAGE_LENGTH = 2000;

function parseBody(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return undefined;
  const raw = (body as Record<string, unknown>)["body"];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) return undefined;
  return trimmed;
}

async function bearerUser(userId: string | undefined) {
  if (!userId) return undefined;
  return findUserById(userId);
}

router.get("/messages/:lawyerId", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "client") {
    res.status(403).json({ error: "forbidden", message: "Only client accounts can use this endpoint." });
    return;
  }
  const lawyerId = paramString(req.params.lawyerId);
  const lawyer = (await db.Lawyer.findOne({ id: lawyerId }).lean()) as
    | { id: string; name: string; avatar?: string | null }
    | null;
  if (!lawyer) {
    res.status(404).json({ error: "not_found", message: "Lawyer not found." });
    return;
  }
  await markConversationRead(`${user.id}:${lawyerId}`, user.id);
  const messages = await getMessagesBetween(user.id, lawyerId);
  res.json({
    lawyer: {
      id: lawyer.id,
      name: lawyer.name,
      avatar: lawyer.avatar ?? "",
    },
    messages,
  });
});

router.post("/messages/:lawyerId", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "client") {
    res.status(403).json({ error: "forbidden", message: "Only client accounts can use this endpoint." });
    return;
  }
  const lawyerId = paramString(req.params.lawyerId);
  const lawyer = (await db.Lawyer.findOne({ id: lawyerId }).lean()) as
    | { id: string; name: string; avatar?: string | null }
    | null;
  if (!lawyer) {
    res.status(404).json({ error: "not_found", message: "Lawyer not found." });
    return;
  }
  const body = parseBody(req.body);
  if (body === undefined) {
    res.status(400).json({ error: "invalid_payload", message: "Message body must be 1-2000 characters." });
    return;
  }
  const message = await createMessage({
    clientId: user.id,
    lawyerId,
    senderId: user.id,
    senderRole: "client",
    senderName: user.name,
    body,
  });
  emitToUsers(user.id, lawyerId, "message:new", message);
  // notify lawyer async (email/sms/push respect user prefs)
  void (async () => {
    try {
      const { sendEmailIfEnabled } = await import("../lib/email");
      const { sendSmsIfEnabled } = await import("../lib/sms");
      const { sendPushIfEnabled } = await import("../lib/push");
      const recipient = await findUserById(lawyerId);
      if (recipient) {
        const preview = body.slice(0, 120);
        await Promise.all([
          sendEmailIfEnabled(lawyerId, recipient.email, "message", `New message from ${user.name}`, `<p>${preview}</p><p><a href="${process.env.FRONTEND_URL ?? "http://localhost:5173"}/lawyer/messages">Reply on NyayaConnect</a></p>`),
          recipient.phone ? sendSmsIfEnabled(lawyerId, recipient.phone, "message", `NyayaConnect: ${user.name}: ${preview}`) : Promise.resolve(false),
          sendPushIfEnabled(lawyerId, "message", { title: `New message from ${user.name}`, body: preview, url: "/lawyer/messages" }),
        ]);
      }
    } catch {}
  })();
  res.status(201).json(message);
});

router.get("/client/messages", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "client") {
    res.status(403).json({ error: "forbidden", message: "Only client accounts can use this endpoint." });
    return;
  }
  const conversations = await getClientConversations(user.id);
  res.json(conversations);
});

router.get("/lawyer/messages", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "lawyer") {
    res.status(403).json({ error: "forbidden", message: "Only lawyer accounts can use this endpoint." });
    return;
  }
  const conversations = await getLawyerConversations(user.id);
  res.json(conversations);
});

router.get("/lawyer/messages/lookup", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "lawyer") {
    res.status(403).json({ error: "forbidden", message: "Only lawyer accounts can use this endpoint." });
    return;
  }
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  if (!email) {
    res.status(400).json({ error: "invalid_payload", message: "email query parameter is required." });
    return;
  }
  const client = await findUserByEmail(email);
  if (!client || client.role !== "client") {
    res.status(404).json({ error: "not_found", message: "No client account matches that email." });
    return;
  }
  const messages = await getMessagesBetween(client.id, user.id);
  res.json({
    userId: client.id,
    name: client.name,
    avatar: client.avatar ?? "",
    messages,
  });
});

router.post("/lawyer/messages/:clientId", async (req, res): Promise<void> => {
  const userId = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1]?.trim();
  const user = await bearerUser(userId && verifyToken(userId));
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  if (user.role !== "lawyer") {
    res.status(403).json({ error: "forbidden", message: "Only lawyer accounts can use this endpoint." });
    return;
  }
  const clientId = paramString(req.params.clientId);
  const client = await findUserById(clientId);
  if (!client) {
    res.status(404).json({ error: "not_found", message: "Client not found." });
    return;
  }
  const body = parseBody(req.body);
  if (body === undefined) {
    res.status(400).json({ error: "invalid_payload", message: "Message body must be 1-2000 characters." });
    return;
  }
  const message = await createMessage({
    clientId,
    lawyerId: user.id,
    senderId: user.id,
    senderRole: "lawyer",
    senderName: user.name,
    body,
  });
  await markConversationRead(`${clientId}:${user.id}`, user.id);
  emitToUsers(clientId, user.id, "message:new", message);
  void (async () => {
    try {
      const { sendEmailIfEnabled } = await import("../lib/email");
      const { sendSmsIfEnabled } = await import("../lib/sms");
      const { sendPushIfEnabled } = await import("../lib/push");
      const recipient = await findUserById(clientId);
      if (recipient) {
        const preview = body.slice(0, 120);
        await Promise.all([
          sendEmailIfEnabled(clientId, recipient.email, "message", `New message from ${user.name}`, `<p>${preview}</p><p><a href="${process.env.FRONTEND_URL ?? "http://localhost:5173"}/dashboard/messages">Reply on NyayaConnect</a></p>`),
          recipient.phone ? sendSmsIfEnabled(clientId, recipient.phone, "message", `NyayaConnect: ${user.name}: ${preview}`) : Promise.resolve(false),
          sendPushIfEnabled(clientId, "message", { title: `New message from ${user.name}`, body: preview, url: "/dashboard/messages" }),
        ]);
      }
    } catch {}
  })();
  res.status(201).json(message);
});

export default router;