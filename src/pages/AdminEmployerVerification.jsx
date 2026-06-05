import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { displayName } from "../data/user.js";

export default function AdminEmployerVerification() {
  const role = localStorage.getItem("role") || "admin";
  const [employers, setEmployers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [flash,     setFlash]     = useState("");
  const [confirm,   setConfirm]   = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/api/admin/users")
      .then(res => {
        const users = res.data.users || res.data;
        setEmployers(users.filter(u => u.role === "employer"));
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function verify(id) {
    try {
      await api.put(`/api/admin/employers/${id}/verify`);
      setFlash("Employer verified.");
      setConfirm(null); load();
    } catch (err) { setError(err.response?.data?.message || "Could not verify."); }
  }

  const unverified = employers.filter(e => !e.isVerified);

  return (
    <DashboardLayout role={role}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Employer Verification</h1>
          <p>Review and verify employer accounts before they can post jobs.</p>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {flash && <div className="alert alert-success">{flash}</div>}
      {loading && <div className="loading-row">Loading...</div>}
      {!loading && (
        <div className="card">
          <div className="card-header">
            <h2>Employers</h2>
            {unverified.length > 0 && <span className="badge badge-yellow">{unverified.length} pending</span>}
          </div>
          <table className="data-table">
            <thead><tr><th>Company</th><th>Email</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {employers.map(emp => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: 600 }}>{emp.companyName || displayName(emp)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{emp.email}</td>
                  <td style={{ color: "var(--text-muted)" }}>{emp.contactNumber || "--"}</td>
                  <td><span className={emp.isVerified ? "badge badge-green" : "badge badge-yellow"}>{emp.isVerified ? "Verified" : "Pending"}</span></td>
                  <td>{!emp.isVerified && <button className="btn btn-sm" onClick={() => setConfirm(emp)}>Verify</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Verify Employer</h3>
            <p>Verify <strong>{confirm.companyName || displayName(confirm)}</strong>? They will be able to post jobs immediately.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn" onClick={() => verify(confirm._id)}>Verify</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
