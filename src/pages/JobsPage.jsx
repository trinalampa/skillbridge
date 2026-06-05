import { useEffect, useState, useCallback } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Pagination from "../components/Pagination.jsx";
import { SkeletonCard } from "../components/SkeletonCard.jsx";
import { JOB_TYPES, PAGE_SIZE, STATUS_BADGE } from "../constants.js";

function JobDetailModal({ job, onClose, onApply, applied }) {
  if (!job) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: 4 }}>{job.title}</h3>
            <div style={{ color: "var(--text-muted)", fontSize: ".88rem" }}>{job.companyName}</div>
          </div>
          <button className="btn btn-sm btn-outline" onClick={onClose} style={{ flexShrink: 0, marginLeft: 12 }}>Close</button>
        </div>
        <div className="job-meta modal-body">
          {job.location && <span>{job.location}</span>}
          {job.jobType  && <span> · {job.jobType}</span>}
        </div>
        {job.requiredSkills?.length > 0 && (
          <div className="skills-row">
            {job.requiredSkills.map(s => <span className="skill-chip" key={s}>{s}</span>)}
          </div>
        )}
        <p className="job-desc-full">{job.description}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          {applied ? (
            <span className="badge badge-green" style={{ padding: "10px 20px" }}>Applied</span>
          ) : (
            <button className="btn" onClick={() => onApply(job._id)}>Apply Now</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ job, onClose, onConfirm, loading }) {
  if (!job) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <h3>Confirm Application</h3>
        <p>
          You are about to apply for <strong>{job.title}</strong> at <strong>{job.companyName}</strong>.
          Make sure your profile is up to date before submitting.
        </p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" onClick={onConfirm} disabled={loading}>
            {loading ? "Submitting..." : "Confirm & Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs,       setJobs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [type,       setType]       = useState("");
  const [loading,    setLoading]    = useState(true);
  const [message,    setMessage]    = useState({ type: "", text: "" });
  const [applied,    setApplied]    = useState(new Set());
  const [detailJob,  setDetailJob]  = useState(null);
  const [applyJob,   setApplyJob]   = useState(null);
  const [applying,   setApplying]   = useState(false);

  const fetchJobs = useCallback((p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, search, type });
    api.get(`/api/jobs?${params}`)
      .then(res => {
        setJobs(res.data.jobs);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setPage(p);
      })
      .catch(err => setMessage({ type: "error", text: err.response?.data?.message || "Could not load jobs." }))
      .finally(() => setLoading(false));
  }, [search, type]);

  useEffect(() => { fetchJobs(1); }, [search, type]);

  async function submitApplication() {
    if (!applyJob) return;
    setApplying(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post(`/api/jobs/${applyJob._id}/apply`);
      setApplied(prev => new Set([...prev, applyJob._id]));
      setMessage({ type: "success", text: `Application submitted for ${applyJob.title}!` });
      setApplyJob(null);
      setDetailJob(null);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not submit application." });
      setApplyJob(null);
    } finally {
      setApplying(false);
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Browse Jobs</h1>
          <p>All listings are verified and approved by the admin team.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by title, company, or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {(search || type) && (
          <button className="btn btn-sm btn-outline" onClick={() => { setSearch(""); setType(""); }}>Clear</button>
        )}
      </div>

      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="jobs-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "2rem", marginBottom: 10, opacity: .4 }}>No results</div>
          No jobs match your search. Try different keywords or clear the filters.
        </div>
      ) : (
        <>
          <p style={{ color: "var(--text-muted)", marginBottom: 16, fontSize: ".88rem" }}>
            Showing {jobs.length} of {total} {total === 1 ? "job" : "jobs"}
          </p>
          <div className="jobs-grid">
            {jobs.map(job => (
              <div
                className="job-card"
                key={job._id}
                style={{ cursor: "pointer" }}
                onClick={() => setDetailJob(job)}
              >
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
                <div className="job-card-footer" style={{ marginTop: "auto", paddingTop: 12 }}>
                  {applied.has(job._id) ? (
                    <span className={STATUS_BADGE["Pending"]} style={{ display: "block", textAlign: "center", padding: "8px" }}>
                      Applied
                    </span>
                  ) : (
                    <button
                      className="btn btn-sm"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={e => { e.stopPropagation(); setApplyJob(job); }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={p => fetchJobs(p)} />
        </>
      )}

      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onApply={job => { setDetailJob(null); setApplyJob(jobs.find(j => j._id === job)); }}
        applied={detailJob && applied.has(detailJob._id)}
      />

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onConfirm={submitApplication}
        loading={applying}
      />
    </DashboardLayout>
  );
}
