import { Router, type IRouter } from "express";
import * as db from "@workspace/db";
import { requireAdmin } from "../lib/admin";

const router: IRouter = Router();

router.get("/admin/audit-logs", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const logs = await db.AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json(logs);
});

export default router;
