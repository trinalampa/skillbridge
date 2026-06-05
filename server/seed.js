import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Job from "./models/Job.js";
import Application from "./models/Application.js";
import StudentProfile from "./models/StudentProfile.js";

dotenv.config();

try {
  await connectDB();

  await Promise.all([
    Application.deleteMany(),
    StudentProfile.deleteMany(),
    Job.deleteMany(),
    User.deleteMany()
  ]);

  const superAdmin = await User.create({
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@skillbridge.com",
    password: "password123",
    role: "superadmin",
    isVerified: true,
    isActive: true
  });

  const admin = await User.create({
    firstName: "System",
    lastName: "Admin",
    email: "admin@skillbridge.com",
    password: "password123",
    role: "admin",
    isVerified: true,
    isActive: true
  });

  const student = await User.create({
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "student@skillbridge.com",
    password: "password123",
    role: "student",
    isVerified: true,
    isActive: true,
    course: "BSIT",
    yearLevel: "4th Year",
    skills: ["React", "Node.js", "MongoDB", "CSS"],
    location: "Quezon City",
    careerInterest: "Developer",
    profileCompletion: 85
  });

  const employer = await User.create({
    firstName: "Maria",
    lastName: "Santos",
    email: "employer@skillbridge.com",
    password: "password123",
    role: "employer",
    isVerified: true,
    isActive: true,
    companyName: "SkillBridge Demo Company",
    companyAddress: "Quezon City",
    companyDescription: "A demo employer account for SkillBridge.",
    contactNumber: "09171234567"
  });

  const pendingEmployer = await User.create({
    firstName: "Carlo",
    lastName: "Reyes",
    email: "pendingemployer@skillbridge.com",
    password: "password123",
    role: "employer",
    isVerified: false,
    isActive: true,
    companyName: "FutureWorks PH"
  });

  await StudentProfile.create({
    user: student._id,
    course: student.course,
    yearLevel: student.yearLevel,
    skills: student.skills,
    location: student.location,
    careerInterest: student.careerInterest,
    profileCompletion: student.profileCompletion
  });

  const jobs = await Job.insertMany([
    { employer: employer._id, companyName: "SkillBridge Demo Company", title: "Frontend Developer Intern", description: "Build responsive React interfaces for client projects.", requiredSkills: ["React", "CSS", "API"], location: "Quezon City", isApproved: true, status: "Approved" },
    { employer: employer._id, companyName: "SkillBridge Demo Company", title: "MERN Stack Intern", description: "Assist in developing full-stack applications using MongoDB, Express, React, and Node.", requiredSkills: ["MongoDB", "Express", "React", "Node.js"], location: "Hybrid", isApproved: true, status: "Approved" },
    { employer: employer._id, companyName: "SkillBridge Demo Company", title: "QA Tester Intern", description: "Prepare test cases, report bugs, and verify fixes.", requiredSkills: ["Testing", "Documentation"], location: "Remote", isApproved: true, status: "Approved" },
    { employer: pendingEmployer._id, companyName: "FutureWorks PH", title: "Backend Developer Intern", description: "Create secure Express API routes and MongoDB schemas.", requiredSkills: ["Node.js", "Express", "MongoDB"], location: "Manila", isApproved: false, status: "Pending" }
  ]);

  await Application.create({
    job: jobs[0]._id,
    student: student._id,
    employer: employer._id,
    status: "Shortlisted"
  });

  console.log("Seed complete");
  console.log("Super Admin: superadmin@skillbridge.com / password123");
  console.log("Admin: admin@skillbridge.com / password123");
  console.log("Student: student@skillbridge.com / password123");
  console.log("Employer: employer@skillbridge.com / password123");
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
