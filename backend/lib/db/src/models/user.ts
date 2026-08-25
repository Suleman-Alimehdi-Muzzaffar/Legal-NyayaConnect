import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, required: true },
    city: String,
    state: String,
    avatar: String,
    notificationPreferences: {
      type: Map,
      of: Boolean,
      default: new Map([
        ['appointments_email', true],
        ['appointments_sms', true],
        ['documents_email', true],
        ['documents_sms', false],
        ['messages_email', true],
        ['messages_sms', true],
        ['promos_email', false],
        ['promos_sms', false],
        ['payments_email', true],
        ['payments_sms', false],
        ['hearings_email', true],
        ['hearings_sms', true],
        ['reviews_email', true],
        ['reviews_sms', false],
      ]),
    },
  },
  { strict: false, collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

export const User = mongoose.models.User ?? model("User", userSchema);
