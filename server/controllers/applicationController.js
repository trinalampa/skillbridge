import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import httpError from "../config/httpError.js";

const VALID_STATUSES = ["Pending", "Under Review", "Shortlisted", "Rejected", "Accepted"];

function assertObjectId(value, label = "id") {
  if (!mongoose.isValidObjectId(value)) {
    throw httpError(400, `Invalid ${label}.`);
  }
}

// Student: view their own applications
export async function myApplications(req, res) {
  const apps = await Application.find({ student: req.user._id })
    .populate("job")
    .sort({ appliedAt: -1 });

  res.json(apps);
}

// Employer: view applicants for one of their jobs
export async function employerApplicants(req, res) {
  assertObjectId(req.params.jobId, "job id");

  const job = await Job.findById(req.params.jobId);
  if (!job) throw httpError(404, "Job not found.");

  if (job.employer.toString() !== req.user._id.toString()) {
    throw httpError(403, "You can only view applicants for your own jobs.");
  }

  const apps = await Application.find({ job: job._id })
    .populate("student", "firstName lastName email course yearLevel skills")
    .populate("job",     "title companyName");

  res.json(apps);
}

// Employer or Admin: update an application's status
export async function updateStatus(req, res) {
  assertObjectId(req.params.id, "application id");

  const { status, interviewDate, notes } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw httpError(400, `Status must be one of: ${VALID_STATUSES.join(", ")}.`);
  }

  const app = await Application.findById(req.params.id);
  if (!app) throw httpError(404, "Application not found.");

  // Employers may only update apps for their own jobs
  if (req.user.role === "employer" && app.employer.toString() !== req.user._id.toString()) {
    throw httpError(403, "You can only update applications for your own job posts.");
  }

  app.status = status;
  if (interviewDate !== undefined) app.interviewDate = interviewDate;
  if (notes !== undefined)         app.notes = notes;
  await app.save();

  res.json(app);
}

export async function withdrawApplication(req, res) {
  assertObjectId(req.params.id, "application id");

  const app = await Application.findById(req.params.id);
  if (!app) throw httpError(404, "Application not found.");

  if (app.student.toString() !== req.user._id.toString()) {
    throw httpError(403, "You can only withdraw your own applications.");
  }

  if (app.status !== "Pending") {
    throw httpError(400, "You can only withdraw applications that are still Pending.");
  }

  await app.deleteOne();
  res.json({ message: "Application withdrawn." });
}