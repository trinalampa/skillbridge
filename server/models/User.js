import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ["student", "employer", "admin", "superadmin"],
    default: "student"
  },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  course: String,
  yearLevel: String,
  skills: [String],
  companyName: String,
  companyAddress: String,
  companyDescription: String,
  contactNumber: String,
  resumeUrl: String,
  location: String,
  careerInterest: String,
  profileCompletion: { type: Number, default: 40 }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (this.isModified("isActive")) {
    this.status = this.isActive ? "active" : "disabled";
  } else if (this.isModified("status")) {
    this.isActive = this.status === "active";
  }

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
