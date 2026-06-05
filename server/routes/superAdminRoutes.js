import express from "express";
import { createAdmin, setUserActiveStatus, users } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();
router.use(protect, authorize("superadmin"));
router.get("/users", asyncHandler(users));
router.post("/admins", asyncHandler(createAdmin));
router.put("/users/:id/status", asyncHandler(setUserActiveStatus));
export default router;
