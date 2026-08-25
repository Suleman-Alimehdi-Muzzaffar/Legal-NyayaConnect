import mongoose, { Schema, model } from "mongoose";

const clientSchema = new Schema(
  {
    id: { type: String, required: true },
    name: String,
    initials: String,
    gradient: String,
    email: String,
    phone: String,
    city: String,
    caseType: String,
    status: String,
    visibility: String,
    lastContact: String,
    totalSessions: Number,
    amountPaid: Number,
    nextAppointment: String,
    notes: String,
  },
  { strict: false, collection: "clients" },
);

clientSchema.index({ id: 1 });
clientSchema.index({ email: 1 });

export const Client = mongoose.models.Client ?? model("Client", clientSchema);
