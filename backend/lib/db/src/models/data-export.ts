import mongoose, { Schema, model } from "mongoose";

const dataExportSchema = new Schema(
  {
    id: { type: String, required: true },
    email: String,
    userName: String,
    status: String,
    requestedAt: String,
    decidedAt: String,
    reason: String,
  },
  { strict: false, collection: "dataexports" },
);

dataExportSchema.index({ id: 1 });
dataExportSchema.index({ email: 1, status: 1 });

export const DataExport = mongoose.models.DataExport ?? model("DataExport", dataExportSchema);