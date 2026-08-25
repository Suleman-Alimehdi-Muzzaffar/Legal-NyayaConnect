import mongoose, { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    id: { type: String, required: true },
    lawyerName: String,
    lawyerAvatar: String,
    lawyerGradient: String,
    specialization: String,
    date: String,
    time: String,
    duration: Number,
    mode: String,
    status: String,
    caseType: String,
    notes: String,
    fee: Number,
    meetLink: String,
    // Reschedule request (client → lawyer approval)
    rescheduleRequested: Boolean,
    rescheduleRequestedAt: String,
    rescheduleReason: String,
    requestedDate: String,
    requestedTime: String,
    requestedBy: String,
    requestedByName: String,
    originalDate: String,
    originalTime: String,
  },
  { strict: false, collection: "appointments" },
);

appointmentSchema.index({ lawyerName: 1, date: 1, time: 1 });
appointmentSchema.index({ date: 1, status: 1 });

export const Appointment = mongoose.models.Appointment ?? model("Appointment", appointmentSchema);
