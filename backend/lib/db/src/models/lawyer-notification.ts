import mongoose, { Schema, model } from "mongoose";

const lawyerNotificationSchema = new Schema(
  {
    id: { type: String, required: true },
    type: String,
    title: String,
    message: String,
    timestamp: String,
    isRead: Boolean,
    actionLabel: String,
    actionLink: String,
  },
  { strict: false, collection: "lawyernotifications" },
);

export const LawyerNotification =
  mongoose.models.LawyerNotification ?? model("LawyerNotification", lawyerNotificationSchema);
