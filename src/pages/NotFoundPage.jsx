import { Link, useNavigate } from "react-router-dom";
import { dashboardPathForRole } from "../data/routes.js";

export default function NotFoundPage() {
  const navigate  = useNavigate();
  const savedRole = localStorage.getItem("role");

  return (
    <div className="not-found">
      <div className="code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
        {savedRole ? (
          <Link to={dashboardPathForRole(savedRole)} className="btn">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn">Sign In</Link>
        )}
      </div>
    </div>
  );
}
