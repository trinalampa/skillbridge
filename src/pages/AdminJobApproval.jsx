import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

export default function AdminJobApproval() {
  const role = localStorage.getItem("role") || "admin";
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

  async function approveJob(id) {
    try {
      await api.put(`/api/admin/jobs/${id}/approve`);
      setFlash("Job approved and is now live.");
      setConfirm(null); load();
    } catch (err) { setError(err.response?.data?.message || "Could not approve."); }
  }

  const pending = jobs.filter(j => !j.isApproved);

  return (
    <DashboardLayout role={role}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Job Approval</h1>
          <p>Review and approve job listings submitted by employers.</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {flash && <div className="alert alert-success">{flash}</div>}
      {loading && <div className="loading-row">Loading...</div>}
      {!loading && (
        <div className="card">
          <div className="card-header">
            <h2>Job Queue</h2>
            {pending.length > 0 && <span className="badge badge-yellow">{pending.length} pending</span>}
          </div>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td style={{ fontWeight: 600 }}>{job.title}</td>
                  <td style={{ color: "var(--text-muted)" }}>{job.companyName}</td>
                  <td style={{ color: "var(--text-muted)" }}>{job.jobType}</td>
                  <td><span className={job.isApproved ? "badge badge-green" : "badge badge-yellow"}>{job.isApproved ? "Live" : "Pending"}</span></td>
                  <td>{!job.isApproved && <button className="btn btn-sm" onClick={() => setConfirm(job)}>Approve</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Approve Job</h3>
            <p>Approve <strong>{confirm.title}</strong> by <strong>{confirm.companyName}</strong>? It will go live immediately.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" onClick={() => approveJob(confirm._id)}>Approve</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
