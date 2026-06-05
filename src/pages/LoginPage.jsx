import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { dashboardPathForRole } from "../data/routes.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token",     data.token);
      localStorage.setItem("role",      data.user.role);
      localStorage.setItem("firstName", data.user.firstName || "");
      localStorage.setItem("lastName",  data.user.lastName  || "");
      navigate(dashboardPathForRole(data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel">
        <h1>SkillBridge</h1>
        <p>Your bridge between skills and real career opportunities.</p>
        <ul className="auth-panel-features">
          <li>Personalised job recommendations</li>
          <li>Track your applications in real time</li>
          <li>Verified employers only</li>
          <li>Role-based dashboards for every user type</li>
        </ul>
      </div>

      {/* Right — centered form */}
      <div className="auth-form-wrap-centered">
        <div className="auth-box">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <ThemeToggle />
          </div>
          <h2>Sign In</h2>
          <p className="subtitle">Enter your credentials to continue.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>
            <button className="btn" style={{ width: "100%", marginTop: 6 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
