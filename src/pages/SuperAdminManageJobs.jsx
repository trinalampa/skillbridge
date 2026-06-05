import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

export default function SuperAdminManageJobs() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [flash,   setFlash]   = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/api/admin/jobs")
      .then(res => setJobs(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function deleteJob(job) {
    try {
      await api.delete(`/api/jobs/${job._id}`);
      setFlash(`Job "${job.title}" removed.`);
      setConfirm(null); load();
    } catch (err) { setError(err.response?.data?.message || "Could not remove job."); }
  }

  async function approveJob(id) {
    try {
      await api.put(`/api/admin/jobs/${id}/approve`);
      setFlash("Job approved.");
      load();
    } catch (err) { setError(err.response?.data?.message || "Could not approve."); }
  }

  return (
    <DashboardLayout role="superadmin">
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Manage Job Offers</h1>
          <p>Approve, review, or remove any job listing on the platform.</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {flash && <div className="alert alert-success">{flash}</div>}
      {loading && <div className="loading-row">Loading...</div>}
      {!loading && (
        <div className="card">
          <div className="card-header">
            <h2>All Job Listings</h2>
            <span className="badge badge-gray">{jobs.length} total</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td style={{ fontWeight: 600 }}>{job.title}</td>
                  <td style={{ color: "var(--text-muted)" }}>{job.companyName}</td>
                  <td style={{ color: "var(--text-muted)" }}>{job.jobType}</td>
                  <td style={{ color: "var(--text-muted)" }}>{job.location || "--"}</td>
                  <td><span className={job.isApproved ? "badge badge-green" : "badge badge-yellow"}>{job.isApproved ? "Live" : "Pending"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!job.isApproved && (
                        <button className="btn btn-sm" onClick={() => approveJob(job._id)}>Approve</button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => setConfirm(job)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Remove Job Listing</h3>
            <p>Permanently remove <strong>{confirm.title}</strong> by <strong>{confirm.companyName}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteJob(confirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
