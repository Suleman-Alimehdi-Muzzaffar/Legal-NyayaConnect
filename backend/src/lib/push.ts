import webpush from "web-push";
import * as db from "@workspace/db";
import { isChannelEnabled } from "./notify";
import { logger } from "./logger";

const publicKey = process.env.VAPID_PUBLIC_KEY?.replace(/^"(.*)"$/, "$1").trim();
const privateKey = process.env.VAPID_PRIVATE_KEY?.replace(/^"(.*)"$/, "$1").trim();
const subject = process.env.VAPID_SUBJECT ?? "mailto:support@nyayaconnect.in";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} else {
  logger.warn("VAPID keys not configured — push notifications disabled. Set VAPID_PUBLIC_KEY/PRIVATE_KEY in backend/.env");
}

// In-memory fallback for before DB connected
const memoryStore = new Map<string, PushSubscription[]>();

export type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function saveSubscription(userId: string, sub: PushSubscription): Promise<void> {
  try {
    await db.PushSubscription.updateOne(
      { userId, endpoint: sub.endpoint },
      { $set: { userId, endpoint: sub.endpoint, keys: sub.keys, createdAt: new Date().toISOString() } },
      { upsert: true },
    );
  } catch {
    const arr = memoryStore.get(userId) ?? [];
    if (!arr.some((s) => s.endpoint === sub.endpoint)) arr.push(sub);
    memoryStore.set(userId, arr);
  }
}

export async function removeSubscription(userId: string, endpoint: string): Promise<void> {
  try {
    await db.PushSubscription.deleteOne({ userId, endpoint });
  } catch {
    const arr = memoryStore.get(userId) ?? [];
    memoryStore.set(
      userId,
      arr.filter((s) => s.endpoint !== endpoint)
    );
  }
}

async function getSubscriptions(userId: string): Promise<PushSubscription[]> {
  try {
    const docs = await db.PushSubscription.find({ userId }).lean();
    if (docs.length > 0) return docs as unknown as PushSubscription[];
  } catch {
    // fall through to memory
  }
  return memoryStore.get(userId) ?? [];
}

export async function sendPushIfEnabled(
  userId: string,
  category: string,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  const emailEnabled = await isChannelEnabled(userId, category, "email");
  const smsEnabled = await isChannelEnabled(userId, category, "sms");
  const enabled = emailEnabled || smsEnabled;
  if (!enabled) {
    logger.info({ userId, category }, "push suppressed by preference");
    return;
  }
  const subs = await getSubscriptions(userId);
  if (subs.length === 0) return;
  if (!publicKey || !privateKey) {
    logger.info({ userId, category }, "push would be sent (VAPID not configured)");
    return;
  }
  const data = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as unknown as webpush.PushSubscription, data);
      } catch (err) {
        logger.warn({ err, endpoint: sub.endpoint.slice(0, 40) }, "push send failed — removing subscription");
        await removeSubscription(userId, sub.endpoint);
      }
    })
  );
}

export function getVapidPublicKey(): string | undefined {
  return publicKey;
}
