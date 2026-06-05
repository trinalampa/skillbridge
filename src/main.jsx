import "./App.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App                        from "./App.jsx";
import LoginPage                  from "./pages/LoginPage.jsx";
import RegisterPage               from "./pages/RegisterPage.jsx";
import StudentDashboard           from "./pages/StudentDashboard.jsx";
import EmployerDashboard          from "./pages/EmployerDashboard.jsx";
import EmployerMyJobs             from "./pages/EmployerMyJobs.jsx";
import AdminDashboard             from "./pages/AdminDashboard.jsx";
import AdminJobApproval           from "./pages/AdminJobApproval.jsx";
import AdminEmployerVerification  from "./pages/AdminEmployerVerification.jsx";
import AdminUserDirectory         from "./pages/AdminUserDirectory.jsx";
import SuperAdminDashboard        from "./pages/SuperAdminDashboard.jsx";
import SuperAdminManageJobs       from "./pages/SuperAdminManageJobs.jsx";
import JobsPage                   from "./pages/JobsPage.jsx";
import ApplicationsPage           from "./pages/ApplicationsPage.jsx";
import ProfilePage                from "./pages/ProfilePage.jsx";
import NotFoundPage               from "./pages/NotFoundPage.jsx";

import { ThemeProvider }        from "./services/ThemeContext.jsx";
import { dashboardPathForRole } from "./data/routes.js";

function ProtectedRoute({ children, role }) {
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to={dashboardPathForRole(userRole)} replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<App />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route path="/student/dashboard"    element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/jobs"         element={<ProtectedRoute role="student"><JobsPage /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute role="student"><ApplicationsPage /></ProtectedRoute>} />
          <Route path="/student/profile"      element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />

          {/* Employer */}
          <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/my-jobs"   element={<ProtectedRoute role="employer"><EmployerMyJobs /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"             element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/job-approval"          element={<ProtectedRoute role="admin"><AdminJobApproval /></ProtectedRoute>} />
          <Route path="/admin/employer-verification" element={<ProtectedRoute role="admin"><AdminEmployerVerification /></ProtectedRoute>} />
          <Route path="/admin/user-directory"        element={<ProtectedRoute role="admin"><AdminUserDirectory /></ProtectedRoute>} />

          {/* Super Admin */}
          <Route path="/super-admin/dashboard"   element={<ProtectedRoute role="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/manage-jobs" element={<ProtectedRoute role="superadmin"><SuperAdminManageJobs /></ProtectedRoute>} />
          <Route path="/superadmin/dashboard"    element={<Navigate to="/super-admin/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
