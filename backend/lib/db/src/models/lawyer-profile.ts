import mongoose, { Schema, model } from "mongoose";

const lawyerProfileSchema = new Schema(
  {
    name: String,
    initials: String,
    gradient: String,
    specialization: String,
    city: String,
    rating: Number,
    reviewCount: Number,
    isVerified: Boolean,
    isPremium: Boolean,
    email: String,
    phone: String,
    experience: Number,
    casesWon: Number,
    totalCases: Number,
    consultationFee: Number,
  },
  { strict: false, collection: "lawyerprofiles" },
);

export const LawyerProfile = mongoose.models.LawyerProfile ?? model("LawyerProfile", lawyerProfileSchema);
