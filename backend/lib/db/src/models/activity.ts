import mongoose, { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    id: { type: String, required: true },
    type: String,
    description: String,
    timestamp: String,
    icon: String,
  },
  { strict: false, collection: "activities" },
);

export const Activity = mongoose.models.Activity ?? model("Activity", activitySchema);
