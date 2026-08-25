import mongoose, { Schema, model } from "mongoose";

const documentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: String,
    type: String,
    category: String,
    uploadedAt: String,
    size: String,
    status: String,
    lawyerName: String,
    // Verification workflow — client uploads are verified by lawyers
    uploadedBy: String,
    uploadedByName: String,
    verifiedBy: String,
    verifiedByName: String,
    verifiedAt: String,
    reviewNote: String,
    caseId: String,
    fileName: String,
  },
  { strict: false, collection: "documents" },
);

documentSchema.index({ uploadedBy: 1, status: 1 });
documentSchema.index({ status: 1, uploadedAt: -1 });

export const Document = mongoose.models.Document ?? model("Document", documentSchema);
