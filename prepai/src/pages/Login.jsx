import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="grid-bg">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--cyan)", boxShadow: "0 0 15px #00d4ff66", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "#050810" }}>P</span>
            </div>
            <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, color: "#fff" }}>Prep<span style={{ color: "var(--cyan)" }}>AI</span></span>
          </Link>
          <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Login to continue your interview practice</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
          {error && (
            <div style={{ background: "#ff000015", border: "1px solid #ff000033", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ff6b6b", fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: "100%", background: "#0d1117", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", transition: "border 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#00d4ff55"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: "100%", background: "#0d1117", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none", transition: "border 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#00d4ff55"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#00d4ff88" : "var(--cyan)", color: "#050810", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Syne", boxShadow: "0 0 20px #00d4ff33", transition: "all 0.2s", marginTop: 8 }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 20 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 500 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
