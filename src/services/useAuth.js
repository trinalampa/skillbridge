import { useState, useEffect } from "react";
import api from "./api.js";

// Custom hook — returns the current authenticated user and a loading flag.
// Re-fetches whenever the token changes.
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    api.get("/api/auth/me")
      .then(res => setUser(res.data))
      .catch(err => setError(err.response?.data?.message || "Auth check failed."))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
