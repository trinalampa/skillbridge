import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import httpError from "../config/httpError.js";

const PAGE_SIZE = 10;

function assertObjectId(value, label = "id") {
  if (!mongoose.isValidObjectId(value)) {
    throw httpError(400, `Invalid ${label}.`);
  }
}

export async function dashboard(req, res) {
  const [
    users, jobs, applications,
    pendingEmployers, pendingJobs, admins, activeUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: "employer", isVerified: false }),
    Job.countDocuments({ isApproved: false }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isActive: true }),
  ]);

  res.json({ users, jobs, applications, pendingEmployers, pendingJobs, admins, activeUsers });
}

export async function reports(req, res) {
  const [usersByRole, applicationsByStatus, approvedJobs, pendingJobs] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Job.countDocuments({ isApproved: true }),
    Job.countDocuments({ isApproved: false }),
  ]);

  res.json({ usersByRole, applicationsByStatus, approvedJobs, pendingJobs });
}

// GET /api/admin/users?page=1&role=&search=
export async function users(req, res) {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const role   = req.query.role   || "";
  const search = req.query.search?.trim() || "";

  const filter = {};
  if (role)   filter.role = role;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ];
  }

  const total     = await User.countDocuments(filter);
  const usersList = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE);

  res.json({ users: usersList, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}

export async function verifyEmployer(req, res) {
  assertObjectId(req.params.id, "user id");

  const employer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "employer" },
    { isVerified: true },
    { new: true, runValidators: true }
  );

  if (!employer) throw httpError(404, "Employer not found.");
  res.json(employer);
}

export async function approveJob(req, res) {
  assertObjectId(req.params.id, "job id");

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, status: "Approved" },
    { new: true, runValidators: true }
  );

  if (!job) throw httpError(404, "Job not found.");
  res.json(job);
}

export async function allJobs(req, res) {
  const jobs = await Job.find()
    .populate("employer", "firstName lastName email companyName")
    .sort({ createdAt: -1 });
  res.json(jobs);
}

export async function createAdmin(req, res) {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw httpError(400, "First name, last name, email, and password are required.");
  }

  if (await User.findOne({ email: email.toLowerCase() })) {
    throw httpError(409, "That email is already registered.");
  }

  const admin = await User.create({
    firstName, lastName, email, password,
    role: "admin",
    isVerified: true,
    isActive:   true,
  });

  res.status(201).json({
    _id: admin._id, firstName: admin.firstName,
    lastName: admin.lastName, email: admin.email,
    role: admin.role, isVerified: admin.isVerified, isActive: admin.isActive,
  });
}

export async function setUserActiveStatus(req, res) {
  assertObjectId(req.params.id, "user id");

  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    throw httpError(400, "isActive must be true or false.");
  }

  const target = await User.findById(req.params.id);
  if (!target) throw httpError(404, "User not found.");

  if (target.role === "superadmin") {
    throw httpError(403, "Super Admin accounts cannot be disabled.");
  }

  target.isActive = isActive;
  await target.save();
  res.json(target);
}

export async function changeUserRole(req, res) {
  assertObjectId(req.params.id, "user id");
  const { role } = req.body;
  const allowed = ["student", "employer", "admin"];
  if (!allowed.includes(role)) {
    throw httpError(400, "Role must be student, employer, or admin.");
  }
  const target = await User.findById(req.params.id);
  if (!target) throw httpError(404, "User not found.");
  if (target.role === "superadmin") throw httpError(403, "Cannot change Super Admin role.");
  target.role = role;
  await target.save();
  res.json(target);
}

export async function deleteUser(req, res) {
  assertObjectId(req.params.id, "user id");
  const target = await User.findById(req.params.id);
  if (!target) throw httpError(404, "User not found.");
  if (target.role === "superadmin") throw httpError(403, "Cannot delete Super Admin account.");
  await target.deleteOne();
  res.json({ message: "User deleted." });
}
