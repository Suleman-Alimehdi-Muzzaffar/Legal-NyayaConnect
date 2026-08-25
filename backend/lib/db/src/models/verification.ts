import mongoose, { Schema, model } from "mongoose";

const verificationFileSchema = new Schema(
  {
    name: String,
    fileName: String,
    size: Number,
    type: String,
  },
  { _id: false },
);

const verificationSchema = new Schema(
  {
    id: { type: String, required: true },
    email: { type: String, required: true },
    name: String,
    bciNumber: String,
    status: { type: String, default: "pending" },
    reason: String,
    selfie: verificationFileSchema,
    documents: [verificationFileSchema],
    submittedAt: String,
    reviewedAt: String,
  },
  { strict: false, collection: "verifications" },
);

export const Verification = mongoose.models.Verification ?? model("Verification", verificationSchema);