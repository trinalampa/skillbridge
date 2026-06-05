import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeUrl: String,
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Shortlisted", "Rejected", "Accepted"],
    default: "Pending"
  },
  appliedAt: { type: Date, default: Date.now },
  interviewDate: Date,
  notes: String
}, { timestamps: true });

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
export default mongoose.model("Application", applicationSchema);
