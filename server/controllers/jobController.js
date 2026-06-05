import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import httpError from "../config/httpError.js";

const PAGE_SIZE = 8;

function assertObjectId(value, label = "id") {
  if (!mongoose.isValidObjectId(value)) {
    throw httpError(400, `Invalid ${label}.`);
  }
}

// GET /api/jobs?page=1&search=&type=&location=
export async function getJobs(req, res) {
  const page     = Math.max(1, parseInt(req.query.page) || 1);
  const search   = req.query.search?.trim() || "";
  const type     = req.query.type     || "";
  const location = req.query.location || "";

  const filter = { isApproved: true, status: { $ne: "Closed" } };

  if (search) {
    filter.$or = [
      { title:       { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (type)     filter.jobType  = type;
  if (location) filter.location = { $regex: location, $options: "i" };

  const total = await Job.countDocuments(filter);
  const jobs  = await Job.find(filter)
    .populate("employer", "firstName lastName companyName email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE);

  res.json({ jobs, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}

// GET /api/jobs/:id
export async function getJob(req, res) {
  assertObjectId(req.params.id, "job id");

  const job = await Job.findOne({ _id: req.params.id, isApproved: true })
    .populate("employer", "firstName lastName companyName email");

  if (!job) throw httpError(404, "Job not found.");
  res.json(job);
}

// POST /api/jobs
export async function createJob(req, res) {
  const { title, companyName, description, requiredSkills, jobType, location } = req.body;

  if (!req.user.isVerified) {
    throw httpError(403, "Your employer account needs to be verified by an admin before you can post jobs.");
  }

  if (!title || !description) {
    throw httpError(400, "Title and description are required.");
  }

  const job = await Job.create({
    title,
    companyName: req.user.companyName || companyName,
    description,
    requiredSkills: requiredSkills || [],
    jobType:  jobType  || "Internship",
    location: location || "Remote",
    employer: req.user._id,
  });

  res.status(201).json(job);
}

// GET /api/jobs/employer/mine
export async function getEmployerJobs(req, res) {
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
}

// GET /api/jobs/recommended
// Scoring: skill matches (weighted by rarity) + career interest bonus + recency bonus
export async function getRecommendedJobs(req, res) {
  const studentSkills = (req.user.skills || []).map(s => s.toLowerCase());
  const interest      = req.user.careerInterest?.toLowerCase() || "";

  const allJobs = await Job.find({ isApproved: true, status: { $ne: "Closed" } });

  const now = Date.now();
  const MS_PER_DAY = 86_400_000;

  const scored = allJobs.map(job => {
    // each matching skill = 2 pts
    const skillScore = job.requiredSkills.filter(
      s => studentSkills.includes(s.toLowerCase())
    ).length * 2;

    // career interest in title = 3 pts, in description = 1 pt
    const interestInTitle = interest && job.title.toLowerCase().includes(interest) ? 3 : 0;
    const interestInDesc  = interest && job.description.toLowerCase().includes(interest) ? 1 : 0;

    // recency: jobs posted within 7 days get +1, within 30 days +0.5
    const ageInDays = (now - new Date(job.createdAt).getTime()) / MS_PER_DAY;
    const recencyBonus = ageInDays <= 7 ? 1 : ageInDays <= 30 ? 0.5 : 0;

    const matchScore = skillScore + interestInTitle + interestInDesc + recencyBonus;

    return { ...job.toObject(), matchScore: Math.round(matchScore * 10) / 10 };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  res.json(scored);
}

// POST /api/jobs/:id/apply
export async function applyJob(req, res) {
  assertObjectId(req.params.id, "job id");

  const job = await Job.findOne({
    _id: req.params.id,
    isApproved: true,
    status: { $ne: "Closed" },
  });

  if (!job) throw httpError(404, "Job not found or no longer accepting applications.");

  if (await Application.exists({ job: job._id, student: req.user._id })) {
    throw httpError(409, "You have already applied to this job.");
  }

  const application = await Application.create({
    job:       job._id,
    student:   req.user._id,
    employer:  job.employer,
    resumeUrl: req.user.resumeUrl || "",
  });

  res.status(201).json(application);
}

// DELETE /api/jobs/:id — super admin only
export async function deleteJob(req, res) {
  assertObjectId(req.params.id, "job id");
  const job = await Job.findById(req.params.id);
  if (!job) throw httpError(404, "Job not found.");
  await job.deleteOne();
  res.json({ message: "Job removed." });
}
