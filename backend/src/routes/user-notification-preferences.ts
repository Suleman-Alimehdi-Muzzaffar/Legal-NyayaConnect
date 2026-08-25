import { Router, type IRouter, type Request } from "express";
import { verifyToken } from "../lib/token";
import { findUserById } from "../data/store";
import * as db from "@workspace/db";

const router: IRouter = Router();

async function bearerUser(req: Request) {
  const auth = req.get("authorization");
  const token = auth != null && auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) return undefined;
  return findUserById(userId);
}

router.get("/user/notification-preferences", async (req, res): Promise<void> => {
  const user = await bearerUser(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const prefs =
    user.notificationPreferences instanceof Map
      ? Object.fromEntries(user.notificationPreferences)
      : ((user.notificationPreferences as unknown as Record<string, boolean>) ?? {});
  res.json({ preferences: prefs });
});

router.patch("/user/notification-preferences", async (req, res): Promise<void> => {
  try {
    const user = await bearerUser(req);
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
      return;
    }
    const body = req.body as Record<string, unknown>;
    // Support both { preferences: { k: bool } } and legacy { userId, preferences }
    const rawPrefs = (body.preferences ?? body) as Record<string, unknown>;
    if (!rawPrefs || typeof rawPrefs !== "object" || Array.isArray(rawPrefs)) {
      res.status(400).json({ error: "invalid_payload", message: "preferences object is required" });
      return;
    }

    // Filter to only valid compound keys with boolean values
    const parsed: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(rawPrefs)) {
      if (typeof value !== "boolean") continue;
      if (!key.endsWith("_email") && !key.endsWith("_sms")) continue;
      parsed[key] = value;
    }

    if (Object.keys(parsed).length === 0) {
      res.status(400).json({ error: "invalid_payload", message: "At least one preference channel must be provided" });
      return;
    }

    const fresh = await db.User.findOne({ id: user.id }).lean() as unknown as { notificationPreferences?: Map<string, boolean> } | null;
    const np = new Map<string, boolean>(
      (fresh?.notificationPreferences as unknown as Map<string, boolean> | undefined) ??
        (user.notificationPreferences as unknown as Map<string, boolean> | undefined) ??
        []
    );
    for (const [k, v] of Object.entries(parsed)) np.set(k, v);

    await db.User.updateOne({ id: user.id }, { $set: { notificationPreferences: np } });

    const updated = await db.User.findOne({ id: user.id }).lean() as unknown as { notificationPreferences?: Map<string, boolean> } | null;
    const updatedPrefs =
      updated?.notificationPreferences instanceof Map
        ? Object.fromEntries(updated.notificationPreferences)
        : ((updated?.notificationPreferences as unknown as Record<string, boolean>) ?? Object.fromEntries(np));

    res.json({ preferences: updatedPrefs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "internal_server_error", message: msg });
  }
});

export default router;
