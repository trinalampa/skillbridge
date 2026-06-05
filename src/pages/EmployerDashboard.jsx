import { useEffect, useReducer, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";
import { JOB_TYPES } from "../constants.js";

const BLANK_FORM = { title: "", companyName: "", description: "", requiredSkills: "", location: "", jobType: "Internship" };
const STATUS_OPTIONS = ["Pending", "Under Review", "Shortlisted", "Rejected", "Accepted"];

function formReducer(state, action) {
  if (action.type === "update") return { ...state, [action.name]: action.value };
  if (action.type === "reset")  return BLANK_FORM;
  return state;
}

export default function EmployerDashboard() {
  const [jobs,          setJobs]       = useState([]);
  const [applicantsMap, setApplicants] = useState({});
  const [openId,        setOpenId]     = useState(null);
  const [loading,       setLoading]    = useState(true);
  const [error,         setError]      = useState("");
  const [success,       setSuccess]    = useState("");
  const [submitting,    setSubmitting] = useState(false);
  const [me,            setMe]         = useState({});

  const [form, dispatch] = useReducer(formReducer, BLANK_FORM);
  const updateField = e => dispatch({ type: "update", name: e.target.name, value: e.target.value });

  const loadJobs = () => {
    setLoading(true);
    Promise.all([api.get("/api/jobs/employer/mine"), api.get("/api/auth/me")])
      .then(([jRes, meRes]) => { setJobs(jRes.data); setMe(meRes.data); setError(""); })
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };

  useEffect(loadJobs, []);

  const isPending = me.role === "employer" && !me.isVerified;
  const approved  = jobs.filter(j => j.isApproved).length;
  const pending   = jobs.filter(j => !j.isApproved).length;

  async function postJob(e) {
    e.preventDefault();
    setSuccess(""); setError(""); setSubmitting(true);
    try {
      await api.post("/api/jobs", {
        ...form,
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
      });
      dispatch({ type: "reset" });
      setSuccess("Job submitted for admin approval.");
      loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post job.");
    } finally {
      setSubmitting(false);
    }
  }

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
      {isPending && (
        <div className="pending-banner">
          <h3>Account Pending Verification</h3>
          <p>Your employer account is under review. You can post jobs once verified by an admin. This usually takes less than 24 hours.</p>
        </div>
      )}

      <div className="page-hero">
        <div className="page-hero-text">
          <div className="eyebrow">Employer Dashboard</div>
          <h1>Manage Your Listings</h1>
          <p>Post jobs, track applicants, and manage your listings.</p>
        </div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stat cards - centered row */}
      <div className="stats-grid-centered">
        <div className="stat-card">
          <div className="stat-label">Total Posted</div>
          <div className="stat-value">{jobs.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{approved}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-value">{pending}</div>
        </div>
      </div>

      {/* Post job form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2>Post a New Job</h2></div>
        <div className="card-body">
          <form onSubmit={postJob}>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input name="title" placeholder="Frontend Developer Intern" value={form.title} onChange={updateField} required />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" placeholder="Your Company" value={form.companyName} onChange={updateField} required />
              </div>
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea name="description" placeholder="Describe the role and responsibilities..." value={form.description} onChange={updateField} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Required Skills (comma-separated)</label>
                <input name="requiredSkills" placeholder="React, CSS, Git" value={form.requiredSkills} onChange={updateField} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" placeholder="Remote / Makati, PH" value={form.location} onChange={updateField} />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label>Job Type</label>
              <select name="jobType" value={form.jobType} onChange={updateField}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn" disabled={submitting || isPending}>
              {isPending ? "Verification Required" : submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>
        </div>
      </div>

      {/* Job posts list */}
      <div className="card">
        <div className="card-header">
          <h2>My Job Posts</h2>
          <span className="badge badge-gray">{jobs.length} total</span>
        </div>
        {loading && <div className="loading-row" style={{ padding: "20px 22px" }}>Loading...</div>}
        {!loading && jobs.length === 0 && (
          <div className="empty-state">No jobs posted yet.</div>
        )}
        {jobs.map(job => (
          <div key={job._id} style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="list-row">
              <div className="list-row-info">
                <div className="list-row-name">{job.title}</div>
                <div className="list-row-sub">
                  {job.companyName}{job.location ? ` · ${job.location}` : ""}{job.jobType ? ` · ${job.jobType}` : ""}
                </div>
              </div>
              <span className={job.isApproved ? "badge badge-green" : "badge badge-yellow"}>
                {job.isApproved ? "Approved" : "Pending Approval"}
              </span>
              <button className="btn btn-sm btn-outline" onClick={() => toggleApplicants(job._id)}>
                {openId === job._id ? "Hide Applicants" : "View Applicants"}
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
                        <div className="applicant-meta">{app.student?.email}{app.student?.course ? ` · ${app.student.course}` : ""}</div>
                      </div>
                      <span className={`badge ${
                        app.status === "Accepted"    ? "badge-green"  :
                        app.status === "Rejected"    ? "badge-red"    :
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
