import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  course: String,
  yearLevel: String,
  skills: [String],
  resumeUrl: String,
  location: String,
  careerInterest: String,
  profileCompletion: { type: Number, min: 0, max: 100, default: 40 }
}, { timestamps: true });

export default mongoose.model("StudentProfile", studentProfileSchema);
