import mongoose, { Schema, model } from "mongoose";

const serviceSchema = new Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    documents: [String],
    fee: String,
    lawyerName: String,
    lawyerSpec: String,
    svgType: String,
  },
  { strict: false, collection: "services" },
);

serviceSchema.index({ slug: 1 });

export const Service = mongoose.models.Service ?? model("Service", serviceSchema);
