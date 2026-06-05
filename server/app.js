import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes        from "./routes/authRoutes.js";
import jobRoutes         from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes       from "./routes/adminRoutes.js";
import studentRoutes     from "./routes/studentRoutes.js";
import employerRoutes    from "./routes/employerRoutes.js";
import superAdminRoutes  from "./routes/superAdminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/",           (req, res) => res.json({ message: "SkillBridge API" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth",         authRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/students",     studentRoutes);
app.use("/api/employers",    employerRoutes);
app.use("/api/super-admin",  superAdminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
