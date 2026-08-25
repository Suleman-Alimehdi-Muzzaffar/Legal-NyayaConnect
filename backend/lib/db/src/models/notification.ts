import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema(
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
  { strict: false, collection: "notifications" },
);

notificationSchema.index({ id: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.models.Notification ?? model("Notification", notificationSchema);
