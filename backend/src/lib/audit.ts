import * as db from "@workspace/db";

export async function logAudit(params: {
  actor?: string;
  actorRole?: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    await db.AuditLog.create({
      id: `al${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      actor: params.actor ?? "system",
      actorRole: params.actorRole ?? "system",
      action: params.action,
      targetId: params.targetId ?? "",
      details: params.details ?? {},
      ip: params.ip ?? "",
      createdAt: new Date().toISOString(),
    });
  } catch {}
}
