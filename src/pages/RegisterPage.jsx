import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { dashboardPathForRole } from "../data/routes.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { YEAR_LEVELS } from "../constants.js";

const DEFAULT_FORM = {
  firstName: "", lastName: "", email: "", password: "",
  role: "student",
  course: "", yearLevel: "", skills: "", careerInterest: "", location: "",
  companyName: "", companyAddress: "", companyDescription: "", contactNumber: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update  = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const setRole = role => setForm(p => ({ ...p, role }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = { ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) };
      const { data } = await api.post("/api/auth/register", payload);
      localStorage.setItem("token",     data.token);
      localStorage.setItem("role",      data.user.role);
      localStorage.setItem("firstName", data.user.firstName || "");
      localStorage.setItem("lastName",  data.user.lastName  || "");
      navigate(dashboardPathForRole(data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-wrap">
      <div className="register-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="navbar-brand" style={{ fontSize: "1.1rem" }}>SkillBridge</div>
          <ThemeToggle />
        </div>

        <h2>Create an Account</h2>
        <p className="subtitle">Join SkillBridge as a student or employer.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-cards">
          <div className={`role-card${form.role === "student" ? " selected" : ""}`} onClick={() => setRole("student")}>
            <h4>Student</h4>
            <p>Find internships and jobs matched to your skills</p>
          </div>
          <div className={`role-card${form.role === "employer" ? " selected" : ""}`} onClick={() => setRole("employer")}>
            <h4>Employer</h4>
            <p>Post jobs and find qualified student applicants</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" placeholder="Juan" onChange={update} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" placeholder="Dela Cruz" onChange={update} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="you@example.com" onChange={update} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Minimum 6 characters" onChange={update} required />
          </div>

          {form.role === "student" && (
            <>
              <p className="form-section-title">Academic Details</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Course / Program</label>
                  <input name="course" placeholder="e.g. BS Computer Science" onChange={update} />
                </div>
                <div className="form-group">
                  <label>Year Level</label>
                  <select name="yearLevel" onChange={update}>
                    <option value="">Select year</option>
                    {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input name="skills" placeholder="React, Node.js, MongoDB" onChange={update} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Career Interest</label>
                  <input name="careerInterest" placeholder="e.g. Web Development" onChange={update} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" placeholder="e.g. Manila" onChange={update} />
                </div>
              </div>
            </>
          )}

          {form.role === "employer" && (
            <>
              <p className="form-section-title">Company Details</p>
              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" placeholder="Acme Corp." onChange={update} required />
              </div>
              <div className="form-group">
                <label>Company Address</label>
                <input name="companyAddress" placeholder="123 Ayala Ave, Makati" onChange={update} required />
              </div>
              <div className="form-group">
                <label>About the Company</label>
                <textarea name="companyDescription" placeholder="Briefly describe what your company does" onChange={update} required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input name="contactNumber" placeholder="+63 9XX XXX XXXX" onChange={update} required />
              </div>
            </>
          )}

          <button className="btn" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-switch" style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
