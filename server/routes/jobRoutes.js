import express from "express";
import {
  createJob, deleteJob, getEmployerJobs, getJob,
  getJobs, getRecommendedJobs, applyJob,
} from "../controllers/jobController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();
router.get("/",               protect, asyncHandler(getJobs));
router.get("/recommended",    protect, authorize("student"), asyncHandler(getRecommendedJobs));
router.get("/employer/mine",  protect, authorize("employer"), asyncHandler(getEmployerJobs));
router.post("/",              protect, authorize("employer"), asyncHandler(createJob));
router.get("/:id",            protect, asyncHandler(getJob));
router.post("/:id/apply",     protect, authorize("student"), asyncHandler(applyJob));
router.delete("/:id",         protect, authorize("superadmin"), asyncHandler(deleteJob));
export default router;
