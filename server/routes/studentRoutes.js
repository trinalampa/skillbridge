import express from "express";
import { myApplications } from "../controllers/applicationController.js";
import { getRecommendedJobs } from "../controllers/jobController.js";
import { getProfile, updateProfile } from "../controllers/studentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();
router.use(protect, authorize("student"));
router.get("/profile", asyncHandler(getProfile));
router.put("/profile", asyncHandler(updateProfile));
router.get("/recommended-jobs", asyncHandler(getRecommendedJobs));
router.get("/applications", asyncHandler(myApplications));
export default router;
