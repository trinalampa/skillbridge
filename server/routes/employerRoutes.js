import express from "express";
import { employerApplicants, updateStatus } from "../controllers/applicationController.js";
import { createJob, getEmployerJobs } from "../controllers/jobController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();
router.use(protect, authorize("employer"));
router.post("/jobs", asyncHandler(createJob));
router.get("/jobs", asyncHandler(getEmployerJobs));
router.get("/applicants/:jobId", asyncHandler(employerApplicants));
router.put("/applications/:id/status", asyncHandler(updateStatus));
export default router;
