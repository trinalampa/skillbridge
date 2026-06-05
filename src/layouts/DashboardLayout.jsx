import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

const NAV_CONFIG = {
  student: [
    { to: "/student/dashboard",    label: "Dashboard"    },
    { to: "/student/jobs",         label: "Browse Jobs"  },
    { to: "/student/applications", label: "Applications" },
    { to: "/student/profile",      label: "My Profile"   },
  ],
  employer: [
    { to: "/employer/dashboard",  label: "Dashboard"    },
    { to: "/employer/my-jobs",    label: "My Job Posts" },
  ],
  admin: [
    { to: "/admin/dashboard",            label: "Dashboard"            },
    { to: "/admin/job-approval",         label: "Job Approval"         },
    { to: "/admin/employer-verification",label: "Employer Verification"},
    { to: "/admin/user-directory",       label: "User Directory"       },
  ],
  superadmin: [
    { to: "/super-admin/dashboard",  label: "Dashboard"       },
    { to: "/super-admin/manage-jobs",label: "Manage Job Offers"},
  ],
};

const ROLE_LABELS = {
  student:    "Student",
  employer:   "Employer",
  admin:      "Admin",
  superadmin: "Super Admin",
};

function getInitials() {
  const f = localStorage.getItem("firstName") || "";
  const l = localStorage.getItem("lastName")  || "";
  return ((f[0] || "") + (l[0] || "")).toUpperCase() || "U";
}
function getName() {
  const f = localStorage.getItem("firstName") || "";
  const l = localStorage.getItem("lastName")  || "";
  return [f, l].filter(Boolean).join(" ") || "User";
}

export default function DashboardLayout({ role, children }) {
  const navigate = useNavigate();
  const links    = NAV_CONFIG[role] || [];
  const [showLogout,  setShowLogout]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  function confirmLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">SB</div>
          <span className="sidebar-logo-text">SkillBridge</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-theme"><ThemeToggle /></div>
          <div className="sidebar-profile" onClick={() => setShowProfile(true)}>
            <div className="sidebar-avatar">{getInitials()}</div>
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{getName()}</div>
              <div className="sidebar-profile-role">{ROLE_LABELS[role]}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={() => setShowLogout(true)}>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <div className="page-content">{children}</div>
      </div>

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

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-box" style={{ maxWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Profile</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setShowProfile(false)}>Close</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div className="sidebar-avatar" style={{ width: 48, height: 48, fontSize: "1rem" }}>{getInitials()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{getName()}</div>
                <div style={{ fontSize: ".82rem", color: "var(--primary)", fontWeight: 600, textTransform: "capitalize" }}>
                  {ROLE_LABELS[role]}
                </div>
              </div>
            </div>
            <button className="btn btn-danger" style={{ width: "100%" }}
              onClick={() => { setShowProfile(false); setShowLogout(true); }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
