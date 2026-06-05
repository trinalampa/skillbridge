import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [String],
  jobType: { type: String, enum: ["Internship", "Full-time", "Part-time"], default: "Internship" },
  location: { type: String, default: "Remote" },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ["Pending", "Approved", "Closed"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
