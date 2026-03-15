import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const features = [
    { icon: "", title: "Emotion Detection", desc: "AI analyzes your facial expressions in real time using deep learning" },
    { icon: "", title: "Voice Analysis", desc: "Detects filler words, speaking pace and speech clarity automatically" },
    { icon: "", title: "Grammar Correction", desc: "Powered by Google Gemini to correct and improve your answers" },
    { icon: "", title: "Smart Scoring", desc: "Get scored on confidence, grammar, speech and filler words" },
    { icon: "", title: "Interview Practice", desc: "Practice with real interview questions across multiple categories" },
    { icon: "", title: "Progress Reports", desc: "Track your improvement across all sessions over time" },
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,8,16,0.9)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--cyan)", boxShadow: "0 0 15px #00d4ff66", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "#050810" }}>P</span>
          </div>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#fff" }}>
            Prep<span style={{ color: "var(--cyan)" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ color: "#94a3b8", padding: "8px 20px", borderRadius: 8, fontSize: 14, textDecoration: "none", border: "1px solid var(--border)", transition: "all 0.2s" }}>Login</Link>
          <Link to="/register" style={{ color: "#050810", padding: "8px 20px", borderRadius: 8, fontSize: 14, textDecoration: "none", background: "var(--cyan)", fontWeight: 600, boxShadow: "0 0 15px #00d4ff44" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", position: "relative", overflow: "hidden" }}>

        {/* Background orbs */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #00d4ff11, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #00d4ff08, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
          <div style={{ display: "inline-block", background: "var(--cyan-dim)", border: "1px solid #00d4ff33", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "var(--cyan)", marginBottom: 24, fontWeight: 500 }}>
            AI Powered Interview Training
          </div>

          <h1 style={{ fontFamily: "Syne", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 600, color: "#fff", lineHeight: 1.15, marginBottom: 20, maxWidth: 700 }}>
            Welcome to <span style={{ color: "var(--cyan)", textShadow: "0 0 30px #00d4ff66" }}>PrepAI</span>
            <br />Your Interview Training Partner
          </h1>

          <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Practice interviews with real AI feedback. Improve your confidence, speech clarity and facial expressions with every session.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: "var(--cyan)", color: "#050810", padding: "14px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 30px #00d4ff44", fontFamily: "Syne" }}>
              Start Practicing Free
            </Link>
            <Link to="/login" style={{ border: "1px solid var(--border)", color: "#e2e8f0", padding: "14px 36px", borderRadius: 10, fontSize: 16, textDecoration: "none", background: "transparent" }}>
              Login to Account
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, marginTop: 80, flexWrap: "wrap", justifyContent: "center", opacity: visible ? 1 : 0, transition: "all 1s ease 0.4s" }}>
          {[["7", "Emotions Detected"], ["10+", "Interview Questions"], ["100", "Max Score"], ["Real Time", "AI Feedback"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 600, color: "var(--cyan)" }}>{val}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 12 }}>
            Everything You Need to <span style={{ color: "var(--cyan)" }}>Succeed</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Powered by cutting edge AI technology</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, transition: "all 0.3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#00d4ff44"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 0 30px #00d4ff11"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 48px", textAlign: "center" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff22", borderRadius: 24, padding: "60px 40px", maxWidth: 700, margin: "0 auto", boxShadow: "0 0 60px #00d4ff08" }}>
          <h2 style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Ready to Ace Your Next Interview?
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 14 }}>
            Join PrepAI and start practicing with real AI feedback today.
          </p>
          <Link to="/register" style={{ background: "var(--cyan)", color: "#050810", padding: "14px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: "Syne", boxShadow: "0 0 30px #00d4ff44" }}>
            Get Started Free
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", textAlign: "center", color: "#475569", fontSize: 13 }}>
        PrepAI — AI Powered Interview Training Platform

      </footer>
      <footer style={{borderTop: "2px solid var(--border)", padding: "24px 48px", textAlign: "center", color: "#488868", fontSize:12}}>
        Developed by Toufeeq Mir ,Mir sajad. Hosted on Vercel.
      </footer>
    </div>
  );
};

export default Landing;
