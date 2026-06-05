import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";
import { ROLE_BADGE } from "../constants.js";

export default function AdminUserDirectory() {
  const role = localStorage.getItem("role") || "admin";
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    api.get("/api/admin/users")
      .then(res => setUsers(res.data.users || res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    displayName(u).toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role={role}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>User Directory</h1>
          <p>Browse all registered users on the platform.</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="loading-row">Loading...</div>}
      {!loading && (
        <div className="card">
          <div className="card-header">
            <h2>All Users</h2>
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 240, margin: 0 }}
            />
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600 }}>{displayName(user)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                  <td><span className={`badge role-badge ${user.role}`}>{user.role}</span></td>
                  <td>
                    <span className={user.isActive ? "badge status-active" : "badge status-disabled"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
