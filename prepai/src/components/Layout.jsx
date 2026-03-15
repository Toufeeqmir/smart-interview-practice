import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/session", label: "Practice" },
    { path: "/interview", label: "Interview" },
    { path: "/report", label: "Report" },
  ];

  return (
    <div className="min-h-screen grid-bg" style={{ background: "var(--bg-primary)" }}>
      <nav style={{ background: "rgba(5,8,16,0.9)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--cyan)", boxShadow: "0 0 15px #00d4ff66" }}>
              <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "#050810" }}>P</span>
            </div>
            <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#fff" }}>
              Prep<span style={{ color: "var(--cyan)" }}>AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: location.pathname === link.path ? "var(--cyan)" : "#94a3b8",
                  background: location.pathname === link.path ? "var(--cyan-dim)" : "transparent",
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
                  border: location.pathname === link.path ? "1px solid #00d4ff33" : "1px solid transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--cyan)", color: "#050810" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{ border: "1px solid var(--border)", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", fontSize: 13, background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#00d4ff55"; e.target.style.color = "var(--cyan)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "#94a3b8"; }}
            >
              Logout
            </button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "12px 24px" }} className="md:hidden flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                style={{ color: location.pathname === link.path ? "var(--cyan)" : "#94a3b8", padding: "8px 0", fontSize: 14 }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center", color: "#475569", fontSize: 12 }}>
        PrepAI — AI Powered Interview Training Platform
      </footer>
    </div>
  );
};

export default Layout;
