import express from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../config/asyncHandler.js";

const router = express.Router();

const registerRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/register", registerRules, asyncHandler(register));
router.post("/login",    loginRules,    asyncHandler(login));
router.get("/me", protect, asyncHandler(me));

export default router;
