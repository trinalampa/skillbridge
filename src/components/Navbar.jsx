import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const NAV_LINKS = {
  student: [
    { to: "/student/dashboard",    label: "Dashboard" },
    { to: "/student/jobs",         label: "Browse Jobs" },
    { to: "/student/applications", label: "Applications" },
    { to: "/student/profile",      label: "Profile" },
  ],
  employer:   [],
  admin:      [],
  superadmin: [],
};

const ROLE_LABELS = {
  student:    "Student Portal",
  employer:   "Employer Portal",
  admin:      "Admin Portal",
  superadmin: "Super Admin Portal",
};

function getInitials() {
  const first = localStorage.getItem("firstName") || "";
  const last  = localStorage.getItem("lastName")  || "";
  return (first[0] || "") + (last[0] || "") || "U";
}

export default function Navbar({ role }) {
  const navigate = useNavigate();
  const links    = NAV_LINKS[role] || [];
  const [showLogout, setShowLogout] = useState(false);

  function confirmLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          SkillBridge
          <span>{ROLE_LABELS[role]}</span>
        </div>

        <div className="navbar-links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right">
          <ThemeToggle />
          <div className="nav-avatar" onClick={() => setShowLogout(true)} title="Logout">
            {getInitials()}
          </div>
        </div>
      </nav>

      {/* Logout confirmation modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Sign Out</h3>
            <p>Are you sure you want to log out of SkillBridge?</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
