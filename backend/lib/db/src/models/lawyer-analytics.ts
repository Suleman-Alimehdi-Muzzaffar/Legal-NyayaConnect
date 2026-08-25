import mongoose, { Schema, model } from "mongoose";

const revenuePointSchema = new Schema(
  { month: String, revenue: Number, cases: Number },
  { _id: false },
);

const sliceSchema = new Schema(
  { name: String, value: Number, color: String },
  { _id: false },
);

const weeklySchema = new Schema(
  { week: String, online: Number, offline: Number },
  { _id: false },
);

const ratingPointSchema = new Schema(
  { month: String, rating: Number },
  { _id: false },
);

const lawyerAnalyticsSchema = new Schema(
  {
    revenueData: [revenuePointSchema],
    caseTypeData: [sliceSchema],
    weeklyAppointments: [weeklySchema],
    ratingTrend: [ratingPointSchema],
  },
  { strict: false, collection: "lawyeranalytics" },
);

export const LawyerAnalytics =
  mongoose.models.LawyerAnalytics ?? model("LawyerAnalytics", lawyerAnalyticsSchema);
