import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import httpError from "../config/httpError.js";

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function buildAuthResponse(user) {
  return {
    token: signToken(user),
    user: {
      _id:        user._id,
      firstName:  user.firstName,
      lastName:   user.lastName,
      email:      user.email,
      role:       user.role,
      isVerified: user.isVerified,
    },
  };
}

export async function register(req, res) {
  // express-validator result check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw httpError(400, errors.array()[0].msg);
  }

  const {
    firstName, lastName, email, password,
    role = "student",
    course, yearLevel, skills, careerInterest, location,
    companyName, companyAddress, companyDescription, contactNumber,
  } = req.body;

  if (!["student", "employer"].includes(role)) {
    throw httpError(400, "Public registration only allows Student or Employer accounts.");
  }

  if (role === "employer") {
    if (!companyName || !companyAddress || !companyDescription || !contactNumber) {
      throw httpError(400, "Employer accounts require company name, address, description, and contact number.");
    }
  }

  if (await User.findOne({ email: email.toLowerCase() })) {
    throw httpError(409, "That email is already registered.");
  }

  const user = await User.create({
    firstName, lastName, email, password, role,
    companyName, companyAddress, companyDescription, contactNumber,
    course, yearLevel, skills, careerInterest, location,
    isVerified: role === "student",
  });

  if (role === "student") {
    await StudentProfile.create({
      user: user._id,
      course, yearLevel, skills, careerInterest, location,
    });
  }

  res.status(201).json(buildAuthResponse(user));
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw httpError(400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, "Incorrect email or password.");
  }

  if (!user.isActive) {
    throw httpError(403, "Your account has been disabled. Please contact a Super Admin.");
  }

  res.json(buildAuthResponse(user));
}

export async function me(req, res) {
  res.json(req.user);
}
