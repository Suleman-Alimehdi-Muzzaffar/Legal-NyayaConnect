import mongoose, { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    id: { type: String, required: true },
    actor: String,
    actorRole: String,
    action: String,
    targetId: String,
    details: Schema.Types.Mixed,
    ip: String,
    createdAt: String,
  },
  { strict: false, collection: "auditlogs" },
);

auditLogSchema.index({ id: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog ?? model("AuditLog", auditLogSchema);
