import type { Request, Response } from "express";
import { verifyToken } from "./token";
import { findUserById } from "../data/store";
import type { StoredUser } from "../data/store";

/**
 * Check x-admin-key header against ADMIN_KEY env var.
 * Returns true if authorized, sends error response and returns false otherwise.
 */
export function requireAdmin(req: Request, res: Response): boolean {
  if (!process.env.ADMIN_KEY) {
    res.status(503).json({ error: "admin_not_configured", message: "Set ADMIN_KEY in backend/.env." });
    return false;
  }
  const key = req.get("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: "unauthorized", message: "Invalid or missing admin key." });
    return false;
  }
  return true;
}

/**
 * Extract and verify Bearer token, return the user or undefined.
 * Sends 401 and returns undefined if token is invalid.
 */
export async function bearerUser(req: Request, res: Response): Promise<StoredUser | undefined> {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return undefined;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "User not found." });
    return undefined;
  }
  return user;
}

/**
 * Extract and verify Bearer token, return the user or undefined (silent — no response sent).
 * Use in routes that optionally require auth.
 */
export async function bearerUserOptional(req: Request): Promise<StoredUser | undefined> {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) return undefined;
  return findUserById(userId);
}
