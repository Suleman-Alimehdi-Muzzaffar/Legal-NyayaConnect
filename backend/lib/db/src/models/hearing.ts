import mongoose, { Schema, model } from "mongoose";

const hearingSchema = new Schema(
  {
    id: { type: String, required: true },
    caseNumber: String,
    clientName: String,
    caseTitle: String,
    court: String,
    date: String,
    time: String,
    room: String,
    status: String,
    notes: String,
  },
  { strict: false, collection: "hearings" },
);

export const Hearing = mongoose.models.Hearing ?? model("Hearing", hearingSchema);
