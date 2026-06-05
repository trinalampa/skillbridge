import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import JobCard from "../components/JobCard.jsx";
import { SkeletonCard, SkeletonStat } from "../components/SkeletonCard.jsx";
import { STATUS_BADGE, APP_STATUSES } from "../constants.js";
import { displayName } from "../data/user.js";

function ApplyModal({ job, onClose, onSubmit, loading }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl,   setResumeUrl]   = useState(localStorage.getItem("resumeUrl") || "");

  if (!job) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <h3>Apply for {job.title}</h3>
        <p>{job.companyName}{job.location ? ` · ${job.location}` : ""}</p>
        <div className="apply-form">
          <div className="form-group">
            <label>Resume URL</label>
            <input
              placeholder="https://drive.google.com/..."
              value={resumeUrl}
              onChange={e => setResumeUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Cover Letter (optional)</label>
            <textarea
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" onClick={() => onSubmit(job._id, { coverLetter, resumeUrl })} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [me,       setMe]       = useState({});
  const [jobs,     setJobs]     = useState([]);
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [applyJob, setApplyJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [applied,  setApplied]  = useState(new Set());

  useEffect(() => {
    Promise.all([
      api.get("/api/auth/me"),
      api.get("/api/jobs/recommended"),
      api.get("/api/applications/mine"),
    ])
      .then(([meRes, jobsRes, appsRes]) => {
        setMe(meRes.data);
        setJobs(jobsRes.data.slice(0, 6));
        const appData = appsRes.data;
        setApps(appData);
        setApplied(new Set(appData.map(a => a.job?._id).filter(Boolean)));
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  async function submitApplication(jobId, extra) {
    setApplying(true);
    try {
      await api.post(`/api/jobs/${jobId}/apply`, extra);
      setApplied(prev => new Set([...prev, jobId]));
      setApplyMsg("Application submitted successfully!");
      setApplyJob(null);
    } catch (err) {
      setApplyMsg(err.response?.data?.message || "Could not submit.");
    } finally {
      setApplying(false);
    }
  }

  const pending  = apps.filter(a => a.status === "Pending").length;
  const accepted = apps.filter(a => a.status === "Accepted").length;

  return (
    <DashboardLayout role="student">
      {error    && <div className="alert alert-error">{error}</div>}
      {applyMsg && <div className="alert alert-success">{applyMsg}</div>}

      {loading ? (
        <>
          <div className="stats-grid-centered">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
          </div>
          <div className="jobs-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : (
        <>
          <div className="page-hero">
            <div className="page-hero-text">
              <h1>Hello, {displayName(me)}</h1>
              <p>Here's what's happening with your job search today.</p>
            </div>
          </div>

          {/* Centered stat cards */}
          <div className="stats-grid-centered">
            <div className="stat-card">
              <div className="stat-label">Profile Completion</div>
              <div className="stat-value">{me.profileCompletion || 40}%</div>
              <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
                <div className="progress-bar" style={{ width: `${me.profileCompletion || 40}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Applications Sent</div>
              <div className="stat-value">{apps.length}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Pending Review</div>
              <div className="stat-value">{pending}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Accepted</div>
              <div className="stat-value">{accepted}</div>
            </div>
          </div>

          {/* Recommended jobs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 className="section-title">Recommended for You</h2>
            <button className="btn btn-sm btn-outline" onClick={() => navigate("/student/jobs")}>
              Browse More Jobs
            </button>
          </div>

          {jobs.length > 0 ? (
            <div className="jobs-grid-centered">
              {jobs.map(job => (
                <div className="job-card" key={job._id}>
                  <div className="job-card-top">
                    <div>
                      <div className="job-title">{job.title}</div>
                      <div className="job-company">{job.companyName}</div>
                    </div>
                    {typeof job.matchScore === "number" && job.matchScore > 0 && (
                      <span className="match-badge">{job.matchScore} match</span>
                    )}
                  </div>
                  <div className="job-meta">
                    {job.location && <span>{job.location}</span>}
                    {job.jobType  && <span> · {job.jobType}</span>}
                  </div>
                  {job.description && <p className="job-desc">{job.description}</p>}
                  {job.requiredSkills?.length > 0 && (
                    <div className="skills-row">
                      {job.requiredSkills.map(s => <span className="skill-chip" key={s}>{s}</span>)}
                    </div>
                  )}
                  <div className="job-card-footer" style={{ marginTop: "auto", paddingTop: 10 }}>
                    {applied.has(job._id) ? (
                      <span className="badge badge-green" style={{ display: "block", textAlign: "center", padding: "8px" }}>Applied</span>
                    ) : (
                      <button
                        className="btn btn-sm"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => setApplyJob(job)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No recommendations yet.{" "}
              <Link to="/student/profile" style={{ color: "var(--primary)" }}>Update your profile</Link>{" "}
              to get matched.
            </div>
          )}

          {/* Recent applications */}
          {apps.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "28px 0 14px" }}>
                <h2 className="section-title">Recent Applications</h2>
                <Link to="/student/applications" className="btn btn-sm btn-outline">See All</Link>
              </div>
              <div className="list-card">
                {apps.slice(0, 3).map(app => (
                  <div className="list-row" key={app._id}>
                    <div className="list-row-info">
                      <div className="list-row-name">{app.job?.title || "Deleted Job"}</div>
                      <div className="list-row-sub">{app.job?.companyName}</div>
                    </div>
                    <span className={STATUS_BADGE[app.status] || "badge badge-gray"}>{app.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSubmit={submitApplication}
        loading={applying}
      />
    </DashboardLayout>
  );
}
