import express from "express";
import {
  allJobs,
  approveJob,
  createAdmin,
  dashboard,
  reports,
  setUserActiveStatus,
  users,
  verifyEmployer,
  changeUserRole,
  deleteUser,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();
router.use(protect);

// Admin and Super Admin can monitor and approve platform operations.
router.get("/dashboard", authorize("admin", "superadmin"), asyncHandler(dashboard));
router.get("/users", authorize("admin", "superadmin"), asyncHandler(users));
router.get("/jobs", authorize("admin", "superadmin"), asyncHandler(allJobs));
router.get("/reports", authorize("admin", "superadmin"), asyncHandler(reports));
router.put("/employers/:id/verify", authorize("admin", "superadmin"), asyncHandler(verifyEmployer));
router.put("/jobs/:id/approve", authorize("admin", "superadmin"), asyncHandler(approveJob));

// Only Super Admin can create Admin accounts and disable/enable users.
router.post("/admins", authorize("superadmin"), asyncHandler(createAdmin));
router.put("/users/:id/active", authorize("superadmin"), asyncHandler(setUserActiveStatus));
router.put("/users/:id/role",   authorize("superadmin"), asyncHandler(changeUserRole));
router.delete("/users/:id",     authorize("superadmin"), asyncHandler(deleteUser));

export default router;
