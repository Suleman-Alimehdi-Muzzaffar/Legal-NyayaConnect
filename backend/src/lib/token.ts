import jwt from "jsonwebtoken";
import { tokens as legacyTokens } from "../data/authStore";

const rawJwt = process.env.JWT_SECRET?.replace(/^"(.*)"$/, "$1").trim();
const rawAdmin = process.env.ADMIN_KEY?.replace(/^"(.*)"$/, "$1").trim();
if (!rawJwt) {
  const fallback = rawAdmin ? "ADMIN_KEY" : "hardcoded dev default";
  // eslint-disable-next-line no-console
  console.warn(`[auth] JWT_SECRET not set — using ${fallback}. Set JWT_SECRET in backend/.env for production.`);
}
const JWT_SECRET = rawJwt || rawAdmin || "nyayaconnect-dev-secret-change-me";
const EXPIRES_IN = "7d";

export function signToken(userId: string): string {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: EXPIRES_IN });
  // keep legacy Map for in-memory fast path and for older code that iterates tokens
  legacyTokens.set(token, userId);
  return token;
}

export function verifyToken(token: string): string | undefined {
  if (!token) return undefined;
  // fast path: legacy Map (covers tokens issued before restart if still in memory, plus new JWTs we just added)
  const legacy = legacyTokens.get(token);
  if (legacy) return legacy;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (payload.sub) {
      // cache for next time
      legacyTokens.set(token, payload.sub);
      return payload.sub;
    }
  } catch {
    // invalid / expired
  }
  return undefined;
}

export function revokeToken(token: string): void {
  legacyTokens.delete(token);
  // JWT itself can't be revoked statelessly without blacklist; Map delete prevents fast-path reuse,
  // but token remains valid until expiry. For logout we also delete from Map; client discards it.
}

export function revokeAllForUser(userId: string): void {
  for (const [t, uid] of legacyTokens) {
    if (uid === userId) legacyTokens.delete(t);
  }
}
