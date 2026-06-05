import { Link } from "react-router-dom";
import { dashboardPathForRole } from "./data/routes.js";
import ThemeToggle from "./components/ThemeToggle.jsx";

export default function App() {
  const savedRole = localStorage.getItem("role");
  const dashPath  = dashboardPathForRole(savedRole);

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="navbar-brand">SkillBridge</div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-sm">Get Started</Link>
        </div>
      </header>

      <div className="hero-full">
        <div className="hero-left">
          <span className="hero-tag-plain">Student &amp; Employer Platform</span>
          <h1>
            Find work that fits<br />
            <strong>your skills.</strong>
          </h1>
          <p>
            SkillBridge matches students with verified employers based on
            real skill compatibility. Every listing is reviewed before it reaches you.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="btn">Create Account</Link>
            <Link to={savedRole ? dashPath : "/login"} className="btn btn-outline">
              {savedRole ? "Go to Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <p className="hero-right-title">How it works</p>
          <ul className="hero-steps">
            <li className="hero-step">
              <div className="step-num">1</div>
              <div className="step-text">
                <strong>Create your profile</strong>
                <span>Add your skills, course, and career interests</span>
              </div>
            </li>
            <li className="hero-step">
              <div className="step-num">2</div>
              <div className="step-text">
                <strong>Get matched</strong>
                <span>Our engine surfaces jobs relevant to your skills</span>
              </div>
            </li>
            <li className="hero-step">
              <div className="step-num">3</div>
              <div className="step-text">
                <strong>Apply with confidence</strong>
                <span>Every employer on the platform is verified</span>
              </div>
            </li>
            <li className="hero-step">
              <div className="step-num">4</div>
              <div className="step-text">
                <strong>Track your progress</strong>
                <span>Follow each application from pending to accepted</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
