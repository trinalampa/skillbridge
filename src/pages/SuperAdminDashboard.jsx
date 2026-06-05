import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";
import { ROLE_BADGE, ROLES } from "../constants.js";

const ALL_ROLES = [ROLES.STUDENT, ROLES.EMPLOYER, ROLES.ADMIN];

function randomPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function emailFromName(first, last) {
  if (!first && !last) return "";
  return `${first}.${last}`.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9.]/g, "") + "@skillbridge.admin";
}

const BLANK = { firstName: "", lastName: "", email: "", password: randomPassword() };

export default function SuperAdminDashboard() {
  const name = [localStorage.getItem("firstName"), localStorage.getItem("lastName")].filter(Boolean).join(" ") || "Super Admin";

  const [stats,   setStats]   = useState({});
  const [users,   setUsers]   = useState([]);
  const [form,    setForm]    = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [flash,   setFlash]   = useState("");
  const [working, setWorking] = useState(false);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmRole,   setConfirmRole]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function update(e) {
    const { name: n, value } = e.target;
    setForm(p => {
      const next = { ...p, [n]: value };
      if (n === "firstName" || n === "lastName") {
        next.email = emailFromName(n === "firstName" ? value : p.firstName, n === "lastName" ? value : p.lastName);
      }
      return next;
    });
  }

  function loadData() {
    setLoading(true);
    Promise.all([api.get("/api/admin/dashboard"), api.get("/api/admin/users")])
      .then(([sRes, uRes]) => { setStats(sRes.data); setUsers(uRes.data.users || uRes.data); })
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  async function createAdmin() {
    setError(""); setFlash(""); setWorking(true);
    try {
      await api.post("/api/admin/admins", form);
      setFlash(`Admin account created for ${form.email}. Temp password: ${form.password}`);
      setForm({ ...BLANK, password: randomPassword() });
      setConfirmCreate(false);
      loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not create admin."); setConfirmCreate(false); }
    finally { setWorking(false); }
  }

  async function toggleActive(user) {
    try {
      await api.put(`/api/admin/users/${user._id}/active`, { isActive: !user.isActive });
      setFlash(`${displayName(user)} ${user.isActive ? "disabled" : "enabled"}.`);
      setConfirmToggle(null); loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not update."); setConfirmToggle(null); }
  }

  async function changeRole(user, newRole) {
    try {
      await api.put(`/api/admin/users/${user._id}/role`, { role: newRole });
      setFlash(`${displayName(user)} is now ${newRole}.`);
      setConfirmRole(null); loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not change role."); setConfirmRole(null); }
  }

  async function deleteUser(user) {
    try {
      await api.delete(`/api/admin/users/${user._id}`);
      setFlash(`${displayName(user)} deleted.`);
      setConfirmDelete(null); loadData();
    } catch (err) { setError(err.response?.data?.message || "Could not delete."); setConfirmDelete(null); }
  }

  return (
    <DashboardLayout role="superadmin">
      <div className="page-hero">
        <div className="page-hero-text">
          <div className="eyebrow">Super Admin</div>
          <h1>Welcome back, {name}</h1>
          <p>Full platform control. Manage users, roles, and admin accounts.</p>
        </div>
        
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {flash && <div className="alert alert-success">{flash}</div>}
      {loading && <div className="loading-row">Loading...</div>}

      {!loading && (
        <>
          <div className="stats-grid-centered">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.users || 0}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{stats.activeUsers || 0}</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Admins</div>
              <div className="stat-value">{stats.admins || 0}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Pending Employers</div>
              <div className="stat-value">{stats.pendingEmployers || 0}</div>
            </div>
          </div>

          {/* Create admin form */}
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="card-header">
              <h2>Create Admin Account</h2>
              <button
                className="btn btn-sm"
                disabled={!form.firstName || !form.email || !form.password}
                onClick={() => setConfirmCreate(true)}
              >
                + Add Admin
              </button>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" placeholder="Juan" value={form.firstName} onChange={update} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" placeholder="Dela Cruz" value={form.lastName} onChange={update} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email (auto-generated)</label>
                  <input name="email" type="email" value={form.email} onChange={update} placeholder="Auto-filled from name" />
                </div>
                <div className="form-group">
                  <label>Temporary Password</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input name="password" value={form.password} onChange={update} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-sm btn-outline"
                      onClick={() => setForm(p => ({ ...p, password: randomPassword() }))}>
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User management table */}
          <div className="card">
            <div className="card-header">
              <h2>User Management</h2>
              <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{users.length} total</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isSelf = user.role === "superadmin";
                  return (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 600 }}>{displayName(user)}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{user.email}</td>
                      <td>
                        {isSelf ? (
                          <span className={`badge role-badge ${user.role}`}>{user.role}</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={e => setConfirmRole({ user, newRole: e.target.value })}
                            style={{ width: "auto", minWidth: 110, margin: 0, padding: "4px 8px", fontSize: ".8rem" }}
                          >
                            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={user.isActive ? "badge status-active" : "badge status-disabled"}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        {isSelf ? (
                          <span style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>Protected</span>
                        ) : (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className={`btn btn-sm ${user.isActive ? "btn-outline" : "btn-success"}`}
                              style={user.isActive ? { borderColor: "var(--danger)", color: "var(--danger)" } : {}}
                              onClick={() => setConfirmToggle(user)}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setConfirmDelete(user)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirm create */}
      {confirmCreate && (
        <div className="modal-overlay" onClick={() => setConfirmCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Create Admin Account</h3>
            <p>
              Creating admin account for <strong>{form.firstName} {form.lastName}</strong>.<br />
              Email: <strong>{form.email}</strong><br />
              Temporary password: <strong>{form.password}</strong><br /><br />
              Share these credentials securely. The user should change their password after first login.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmCreate(false)}>Cancel</button>
              <button className="btn" onClick={createAdmin} disabled={working}>{working ? "Creating..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm toggle */}
      {confirmToggle && (
        <div className="modal-overlay" onClick={() => setConfirmToggle(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>{confirmToggle.isActive ? "Deactivate Account" : "Activate Account"}</h3>
            <p>{confirmToggle.isActive
              ? `Deactivating ${displayName(confirmToggle)} will prevent them from logging in.`
              : `Activating ${displayName(confirmToggle)} will restore their access.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmToggle(null)}>Cancel</button>
              <button
                className={`btn ${confirmToggle.isActive ? "btn-danger" : "btn-success"}`}
                onClick={() => toggleActive(confirmToggle)}
              >
                {confirmToggle.isActive ? "Yes, Deactivate" : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm role change */}
      {confirmRole && (
        <div className="modal-overlay" onClick={() => setConfirmRole(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Change Role</h3>
            <p>Change <strong>{displayName(confirmRole.user)}</strong> from <strong>{confirmRole.user.role}</strong> to <strong>{confirmRole.newRole}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmRole(null)}>Cancel</button>
              <button className="btn" onClick={() => changeRole(confirmRole.user, confirmRole.newRole)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p>Permanently delete <strong>{displayName(confirmDelete)}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteUser(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
