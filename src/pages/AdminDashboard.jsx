import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";
import { ROLE_BADGE } from "../constants.js";

export default function AdminDashboard() {
  const role = localStorage.getItem("role") || "admin";
  const name = [localStorage.getItem("firstName"), localStorage.getItem("lastName")].filter(Boolean).join(" ") || "Admin";

  const [stats,   setStats]   = useState({});
  const [users,   setUsers]   = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [flash,   setFlash]   = useState("");
  const [confirmJob, setConfirmJob] = useState(null);
  const [confirmEmp, setConfirmEmp] = useState(null);

  function loadAll() {
    setLoading(true);
    Promise.all([
      api.get("/api/admin/dashboard"),
      api.get("/api/admin/users"),
      api.get("/api/admin/jobs"),
    ])
      .then(([sRes, uRes, jRes]) => {
        setStats(sRes.data);
        setUsers(uRes.data.users || uRes.data);
        setJobs(jRes.data);
        setError("");
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function approveJob(id) {
    try {
      await api.put(`/api/admin/jobs/${id}/approve`);
      setFlash("Job approved and is now live.");
      setConfirmJob(null); loadAll();
    } catch (err) { setError(err.response?.data?.message || "Could not approve job."); }
  }

  async function verifyEmployer(id) {
    try {
      await api.put(`/api/admin/employers/${id}/verify`);
      setFlash("Employer verified.");
      setConfirmEmp(null); loadAll();
    } catch (err) { setError(err.response?.data?.message || "Could not verify employer."); }
  }

  const employers  = users.filter(u => u.role === "employer");
  const unverified = employers.filter(e => !e.isVerified);
  const pendingJobs = jobs.filter(j => !j.isApproved);

  return (
    <DashboardLayout role={role}>
      {/* Welcome hero */}
      <div className="page-hero">
        <div className="page-hero-text">
          <div className="eyebrow">Admin Dashboard</div>
          <h1>Welcome back, {name}</h1>
          <p>Manage employer verifications, job approvals, and platform users.</p>
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
            <div className="stat-card">
              <div className="stat-label">Total Jobs</div>
              <div className="stat-value">{stats.jobs || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Applications</div>
              <div className="stat-value">{stats.applications || 0}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Pending Jobs</div>
              <div className="stat-value">{stats.pendingJobs || 0}</div>
            </div>
          </div>

          {/* Employer verification */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2>Employer Verification</h2>
              {unverified.length > 0 && <span className="badge badge-yellow">{unverified.length} pending</span>}
            </div>
            {employers.length === 0 ? (
              <div className="empty-state">No employers registered yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map(emp => (
                    <tr key={emp._id}>
                      <td style={{ fontWeight: 600 }}>{emp.companyName || displayName(emp)}</td>
                      <td style={{ color: "var(--text-muted)" }}>{emp.email}</td>
                      <td style={{ color: "var(--text-muted)" }}>{emp.contactNumber || "--"}</td>
                      <td>
                        <span className={emp.isVerified ? "badge badge-green" : "badge badge-yellow"}>
                          {emp.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {!emp.isVerified && (
                          <button className="btn btn-sm" onClick={() => setConfirmEmp(emp)}>Verify</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Job approval */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2>Job Approval Queue</h2>
              {pendingJobs.length > 0 && <span className="badge badge-yellow">{pendingJobs.length} pending</span>}
            </div>
            {jobs.length === 0 ? (
              <div className="empty-state">No jobs submitted yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600 }}>{job.title}</td>
                      <td style={{ color: "var(--text-muted)" }}>{job.companyName}</td>
                      <td style={{ color: "var(--text-muted)" }}>{job.jobType}</td>
                      <td>
                        <span className={job.isApproved ? "badge badge-green" : "badge badge-yellow"}>
                          {job.isApproved ? "Live" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {!job.isApproved && (
                          <button className="btn btn-sm" onClick={() => setConfirmJob(job)}>Approve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* User directory */}
          <div className="card">
            <div className="card-header"><h2>User Directory</h2></div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
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
        </>
      )}

      {confirmJob && (
        <div className="modal-overlay" onClick={() => setConfirmJob(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Approve Job Listing</h3>
            <p>Approving <strong>{confirmJob.title}</strong> by <strong>{confirmJob.companyName}</strong> will make it visible to all students immediately.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmJob(null)}>Cancel</button>
              <button className="btn" onClick={() => approveJob(confirmJob._id)}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {confirmEmp && (
        <div className="modal-overlay" onClick={() => setConfirmEmp(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Verify Employer Account</h3>
            <p>Verifying <strong>{confirmEmp.companyName || displayName(confirmEmp)}</strong> will allow them to post jobs on the platform.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmEmp(null)}>Cancel</button>
              <button className="btn" onClick={() => verifyEmployer(confirmEmp._id)}>Verify</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
