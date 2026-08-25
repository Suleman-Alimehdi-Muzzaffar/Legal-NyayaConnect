import { Router, type IRouter } from "express";
import { GoogleAuthStatusQueryParams, GoogleAuthStatusResponse } from "@workspace/api-zod";
import {
  getGoogleAuthUrl,
  isGoogleConfigured,
  storeGoogleTokens,
  hasGoogleTokens,
} from "../lib/google-meet";
import { paramString } from "../lib/params";

const router: IRouter = Router();

function queryString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return paramString(value as string[]);
  return "";
}

router.get("/auth/google", async (req, res): Promise<void> => {
  if (!isGoogleConfigured()) {
    res.status(503).json({ error: "google_not_configured", message: "Google Calendar is not configured on the server" });
    return;
  }
  const userId = queryString(req.query.userId);
  if (!userId) {
    res.status(400).json({ error: "missing_user_id", message: "userId query parameter is required" });
    return;
  }
  res.json({ authorizationUrl: getGoogleAuthUrl(userId) });
});

router.get("/auth/google/callback", async (req, res): Promise<void> => {
  const code = queryString(req.query.code);
  const state = queryString(req.query.state);
  const frontendBase = process.env.FRONTEND_URL ?? `${req.protocol}://${req.get("host") ?? "localhost:5173"}`;

  if (!isGoogleConfigured() || !code || !state) {
    res.redirect(`${frontendBase}/lawyer-dashboard/settings?google=error`);
    return;
  }
  try {
    await storeGoogleTokens(state, code);
    req.log.info({ userId: state }, "google calendar connected");
    res.redirect(`${frontendBase}/lawyer-dashboard/settings?google=connected`);
  } catch (err) {
    req.log.error({ err }, "google oauth callback failed");
    res.redirect(`${frontendBase}/lawyer-dashboard/settings?google=error`);
  }
});

router.get("/auth/google/status", async (req, res): Promise<void> => {
  const result = GoogleAuthStatusQueryParams.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: "validation_error", message: "Invalid query parameters" });
    return;
  }
  const data = GoogleAuthStatusResponse.parse({ connected: hasGoogleTokens(result.data.userId) });
  res.json(data);
});

export default router;
