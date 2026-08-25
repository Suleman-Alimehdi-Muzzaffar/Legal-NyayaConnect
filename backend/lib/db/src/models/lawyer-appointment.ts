import mongoose, { Schema, model } from "mongoose";

const lawyerAppointmentSchema = new Schema(
  {
    id: { type: String, required: true },
    clientName: String,
    clientInitials: String,
    clientGradient: String,
    caseType: String,
    date: String,
    time: String,
    duration: Number,
    mode: String,
    status: String,
    fee: Number,
    isPaid: Boolean,
    notes: String,
    meetLink: String,
    // Reschedule request (mirrored from client Appointment)
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
  { strict: false, collection: "lawyerappointments" },
);

lawyerAppointmentSchema.index({ id: 1 });
lawyerAppointmentSchema.index({ date: 1, time: 1 });

export const LawyerAppointment =
  mongoose.models.LawyerAppointment ?? model("LawyerAppointment", lawyerAppointmentSchema);
