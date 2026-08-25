import mongoose, { Schema, model } from "mongoose";

const pushSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    createdAt: { type: String, required: true },
  },
  { strict: false, collection: "push_subscriptions" },
);

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription = mongoose.models.PushSubscription ?? model("PushSubscription", pushSubscriptionSchema);
