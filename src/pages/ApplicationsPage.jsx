import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { SkeletonRow } from "../components/SkeletonCard.jsx";
import { STATUS_BADGE } from "../constants.js";

export default function ApplicationsPage() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [flash,   setFlash]   = useState("");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    api.get("/api/applications/mine")
      .then(res => setApps(res.data))
      .catch(err => setError(err.response?.data?.message || "Could not load applications."))
      .finally(() => setLoading(false));
  }, []);

  async function withdraw(app) {
    try {
      await api.delete(`/api/applications/${app._id}`);
      setApps(prev => prev.filter(a => a._id !== app._id));
      setFlash("Application withdrawn successfully.");
      setConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not withdraw application.");
      setConfirm(null);
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>My Applications</h1>
          <p>Track the status of every job you've applied to.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {flash && <div className="alert alert-success">{flash}</div>}

      {loading ? (
        <div className="list-card">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="list-card">
          {apps.map(app => (
            <div className="list-row" key={app._id}>
              <div className="list-row-info">
                <div className="list-row-name">{app.job?.title ?? "Deleted Job"}</div>
                <div className="list-row-sub">
                  {app.job?.companyName}
                  {app.job?.location ? ` · ${app.job.location}` : ""}
                </div>
              </div>
              <span className={STATUS_BADGE[app.status] || "badge badge-gray"}>
                {app.status}
              </span>
              <span style={{ fontSize: ".78rem", color: "var(--text-muted)", flexShrink: 0 }}>
                {new Date(app.appliedAt).toLocaleDateString()}
              </span>
              {app.status === "Pending" && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => setConfirm(app)}
                >
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Withdraw Application</h3>
            <p>
              Are you sure you want to withdraw your application for{" "}
              <strong>{confirm.job?.title}</strong> at{" "}
              <strong>{confirm.job?.companyName}</strong>?
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => withdraw(confirm)}>Yes, Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}