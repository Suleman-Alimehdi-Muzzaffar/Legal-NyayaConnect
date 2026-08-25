import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    id: { type: String, required: true },
    lawyerId: String,
    lawyerSlug: String,
    author: String,
    authorId: String,
    rating: Number,
    comment: String,
    caseType: String,
    status: { type: String, default: "pending" },
    createdAt: String,
  },
  { strict: false, collection: "reviews" }
);

reviewSchema.index({ id: 1 });
reviewSchema.index({ lawyerSlug: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

export const Review = mongoose.models.Review ?? model("Review", reviewSchema);
