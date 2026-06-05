import express from "express";
import { employerApplicants, myApplications, updateStatus, withdrawApplication } from "../controllers/applicationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();

router.get("/mine",       protect, authorize("student"),           asyncHandler(myApplications));
router.get("/job/:jobId", protect, authorize("employer"),          asyncHandler(employerApplicants));
router.put("/:id/status", protect, authorize("employer", "admin"), asyncHandler(updateStatus));
router.delete("/:id",     protect, authorize("student"),           asyncHandler(withdrawApplication));

export default router;