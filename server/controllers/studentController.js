import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";

const PROFILE_FIELDS = [
  "course", "yearLevel", "skills",
  "resumeUrl", "location", "careerInterest", "profileCompletion",
];

export async function getProfile(req, res) {
  // upsert so there's always a profile document for the student
  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(profile);
}

export async function updateProfile(req, res) {
  const updates = {};
  for (const field of PROFILE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...updates, user: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  // keep User doc in sync with profile fields too
  await User.findByIdAndUpdate(req.user._id, updates, { runValidators: true });

  res.json(profile);
}
