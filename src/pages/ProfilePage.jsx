import { useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { YEAR_LEVELS } from "../constants.js";
import { displayName } from "../data/user.js";

export default function ProfilePage() {
  const [profile,  setProfile]  = useState(null);
  const [user,     setUser]     = useState({});
  const [form,     setForm]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([api.get("/api/auth/me"), api.get("/api/students/profile")])
      .then(([meRes, profileRes]) => {
        setUser(meRes.data);
        setProfile(profileRes.data);
        setForm({
          course:         profileRes.data.course         || "",
          yearLevel:      profileRes.data.yearLevel       || "",
          skills:         (profileRes.data.skills || []).join(", "),
          careerInterest: profileRes.data.careerInterest  || "",
          location:       profileRes.data.location        || "",
          resumeUrl:      profileRes.data.resumeUrl       || "",
        });
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const update = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) };
      const res = await api.put("/api/students/profile", payload);
      setProfile(res.data);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials   = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const completion = profile?.profileCompletion || 40;

  return (
    <DashboardLayout role="student">
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>My Profile</h1>
          <p>Keep your profile up to date to get better job recommendations.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-row">Loading profile...</div>
      ) : (
        <div className="profile-grid">
          {/* Centered sidebar card */}
          <div className="profile-card-centered">
            <div className="avatar">{initials || "?"}</div>
            <div className="profile-name">{displayName(user)}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: 6 }}>Profile Completion</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--primary)" }}>{completion}%</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${completion}%` }} />
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <div className="card-header"><h2>Edit Details</h2></div>
            <div className="card-body">
              {error   && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={save}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Course / Program</label>
                    <input name="course" value={form.course} onChange={update} placeholder="e.g. BS Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Year Level</label>
                    <select name="yearLevel" value={form.yearLevel} onChange={update}>
                      <option value="">Select year</option>
                      {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input name="skills" value={form.skills} onChange={update} placeholder="React, Node.js, MongoDB" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Career Interest</label>
                    <input name="careerInterest" value={form.careerInterest} onChange={update} placeholder="e.g. Web Development" />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input name="location" value={form.location} onChange={update} placeholder="e.g. Manila" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Resume URL</label>
                  <input name="resumeUrl" value={form.resumeUrl} onChange={update} placeholder="https://drive.google.com/..." />
                </div>
                <button className="btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
