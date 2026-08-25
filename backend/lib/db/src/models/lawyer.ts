import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    id: String,
    author: String,
    rating: Number,
    date: String,
    comment: String,
    caseType: String,
  },
  { _id: false },
);

const weeklyHourSchema = new Schema(
  {
    day: String,
    active: Boolean,
    start: String,
    end: String,
  },
  { _id: false },
);

const slotSchema = new Schema(
  {
    date: String,
    slots: [String],
  },
  { _id: false },
);

const educationSchema = new Schema(
  {
    degree: String,
    institution: String,
    year: Number,
  },
  { _id: false },
);

const lawyerSchema = new Schema(
  {
    id: { type: String, required: true },
    name: String,
    slug: String,
    avatar: String,
    avatarGradient: String,
    specializations: [String],
    primarySpecialization: String,
    experience: Number,
    rating: Number,
    reviewCount: Number,
    city: String,
    state: String,
    languages: [String],
    consultationFee: Number,
    availability: String,
    isVerified: Boolean,
    isPremium: Boolean,
    casesWon: Number,
    totalCases: Number,
    bio: String,
    education: [educationSchema],
    courtRegistrations: [String],
    officeAddress: String,
    phone: String,
    email: String,
    awards: [String],
    reviewsList: [reviewSchema],
    availableSlots: [slotSchema],
    weeklyHours: [weeklyHourSchema],
  },
  { strict: false, collection: "lawyers" },
);

lawyerSchema.index({ slug: 1 }, { unique: true, sparse: true });
lawyerSchema.index({ id: 1 });
lawyerSchema.index({ city: 1, state: 1 });
lawyerSchema.index({ rating: -1 });
lawyerSchema.index({ consultationFee: 1 });
lawyerSchema.index({ name: "text", specializations: "text", city: "text", primarySpecialization: "text" });

export const Lawyer = mongoose.models.Lawyer ?? model("Lawyer", lawyerSchema);
