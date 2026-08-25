import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./token";
import { findUserById, type StoredUser } from "../data/store";

export type AuthRequest = Request & { user?: StoredUser; userId?: string };

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const auth = req.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = token ? verifyToken(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  const user = await findUserById(userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid session token." });
    return;
  }
  req.user = user;
  req.userId = userId;
  next();
}

export function requireRole(...roles: StoredUser["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "forbidden", message: `Requires role: ${roles.join("/")}` });
      return;
    }
    next();
  };
}
