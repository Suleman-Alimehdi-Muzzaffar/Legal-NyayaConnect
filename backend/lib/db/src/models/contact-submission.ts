import mongoose, { Schema, model } from "mongoose";

const attachmentSchema = new Schema(
  {
    name: String,
    size: Number,
    type: String,
    storedPath: String,
  },
  { _id: false },
);

const contactSubmissionSchema = new Schema(
  {
    id: { type: String, required: true },
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
    attachments: [attachmentSchema],
    createdAt: String,
  },
  { strict: false, collection: "contactsubmissions" },
);

export const ContactSubmission =
  mongoose.models.ContactSubmission ?? model("ContactSubmission", contactSubmissionSchema);
