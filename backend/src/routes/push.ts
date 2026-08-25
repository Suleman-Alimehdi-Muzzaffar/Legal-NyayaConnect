import { Router, type IRouter } from "express";
import { verifyToken } from "../lib/token";
import { findUserById } from "../data/store";
import { getVapidPublicKey, saveSubscription, removeSubscription } from "../lib/push";

const router: IRouter = Router();

router.get("/push/vapid-public-key", (_req, res): void => {
  const key = getVapidPublicKey();
  if (!key) {
    res.status(503).json({ error: "not_configured", message: "Push not configured on server" });
    return;
  }
  res.json({ publicKey: key });
});

router.post("/push/subscribe", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const sub = req.body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    res.status(400).json({ error: "invalid_payload" });
    return;
  }
  await saveSubscription(userId, { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
  res.json({ ok: true });
});

router.post("/push/unsubscribe", async (req, res): Promise<void> => {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const { endpoint } = req.body as { endpoint?: string };
  if (endpoint) await removeSubscription(userId, endpoint);
  res.json({ ok: true });
});

export default router;
