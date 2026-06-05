import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";

const STATUS_OPTIONS = ["Pending", "Under Review", "Shortlisted", "Rejected", "Accepted"];

export default function EmployerMyJobs() {
  const [jobs,          setJobs]       = useState([]);
  const [applicantsMap, setApplicants] = useState({});
  const [openId,        setOpenId]     = useState(null);
  const [loading,       setLoading]    = useState(true);
  const [error,         setError]      = useState("");

  useEffect(() => {
    api.get("/api/jobs/employer/mine")
      .then(res => setJobs(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  async function toggleApplicants(jobId) {
    if (openId === jobId) { setOpenId(null); return; }
    setOpenId(jobId);
    if (!applicantsMap[jobId]) {
      try {
        const { data } = await api.get(`/api/applications/job/${jobId}`);
        setApplicants(prev => ({ ...prev, [jobId]: data }));
      } catch { setApplicants(prev => ({ ...prev, [jobId]: [] })); }
    }
  }

  async function updateStatus(jobId, appId, status) {
    const { data } = await api.put(`/api/applications/${appId}/status`, { status });
    setApplicants(prev => ({ ...prev, [jobId]: prev[jobId].map(a => a._id === appId ? data : a) }));
  }

  return (
    <DashboardLayout role="employer">
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>My Job Posts</h1>
          <p>View all your listings and manage applicants.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="loading-row">Loading...</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Job Posts</h2>
          <span className="badge badge-gray">{jobs.length} total</span>
        </div>
        {!loading && jobs.length === 0 && (
          <div className="empty-state">No jobs posted yet. Go to Dashboard to post a job.</div>
        )}
        {jobs.map(job => (
          <div key={job._id} style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="list-row">
              <div className="list-row-info">
                <div className="list-row-name">{job.title}</div>
                <div className="list-row-sub">{job.companyName}{job.location ? ` · ${job.location}` : ""}</div>
              </div>
              <span className={job.isApproved ? "badge badge-green" : "badge badge-yellow"}>
                {job.isApproved ? "Approved" : "Pending Approval"}
              </span>
              <button className="btn btn-sm btn-outline" onClick={() => toggleApplicants(job._id)}>
                {openId === job._id ? "Hide" : "View Applicants"}
              </button>
            </div>
            {openId === job._id && (
              <div className="applicant-panel">
                {(applicantsMap[job._id] || []).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: ".85rem", padding: "10px 0" }}>No applicants yet.</p>
                ) : (
                  applicantsMap[job._id].map(app => (
                    <div className="applicant-row" key={app._id}>
                      <div className="applicant-info">
                        <div className="applicant-name">{displayName(app.student)}</div>
                        <div className="applicant-meta">{app.student?.email}</div>
                      </div>
                      <span className={`badge ${
                        app.status === "Accepted" ? "badge-green" :
                        app.status === "Rejected" ? "badge-red"   :
                        app.status === "Shortlisted" ? "badge-purple" : "badge-yellow"
                      }`}>{app.status}</span>
                      <select value={app.status} onChange={e => updateStatus(job._id, app._id, e.target.value)}>
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
