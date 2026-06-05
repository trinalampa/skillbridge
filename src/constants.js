// Roles
export const ROLES = {
  STUDENT:    "student",
  EMPLOYER:   "employer",
  ADMIN:      "admin",
  SUPERADMIN: "superadmin",
};

// Application pipeline statuses
export const APP_STATUSES = [
  "Pending",
  "Under Review",
  "Shortlisted",
  "Rejected",
  "Accepted",
];

// Job types
export const JOB_TYPES = ["Internship", "Full-time", "Part-time"];

// Year levels
export const YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
];

// Badge colour map for application status
export const STATUS_BADGE = {
  "Pending":      "badge badge-yellow",
  "Under Review": "badge badge-blue",
  "Shortlisted":  "badge badge-purple",
  "Accepted":     "badge badge-green",
  "Rejected":     "badge badge-red",
};

// Badge colour map for user roles
export const ROLE_BADGE = {
  superadmin: "badge role-badge superadmin",
  admin:      "badge role-badge admin",
  employer:   "badge role-badge employer",
  student:    "badge role-badge student",
};

// How many items per page
export const PAGE_SIZE = 8;

// API base URL — Vite injects VITE_API_URL from .env at build time
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
