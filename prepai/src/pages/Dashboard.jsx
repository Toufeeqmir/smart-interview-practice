import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const StatCard = ({ label, value, sub, color }) => (
  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, transition: "all 0.3s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + "44"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
    <div style={{ fontSize: 28, fontFamily: "Syne", fontWeight: 800, color }}>{value}</div>
    <div style={{ color: "#e2e8f0", fontWeight: 600, marginTop: 4, fontSize: 15 }}>{label}</div>
    {sub && <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, sessionsRes, interviewsRes] = await Promise.all([
          API.get("/sessions/report"),
          API.get("/sessions"),
          API.get("/interview/history"),
        ]);
        setReport(reportRes.data.report);
        setSessions(sessionsRes.data.sessions || []);
        setInterviews(interviewsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const emotions = ["happy", "neutral", "sad", "angry", "fear", "disgust", "surprise"];
  const emotionColors = { happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa", angry: "#f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c" };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 800, color: "#fff" }}>
          Welcome back, <span style={{ color: "var(--cyan)" }}>{user?.name}</span>
        </h1>
        <p style={{ color: "#64748b", marginTop: 6, fontSize: 15 }}>Here is your performance overview</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <Link to="/session" style={{ textDecoration: "none", background: "var(--cyan)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 0 30px #00d4ff33", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
          <span style={{ fontSize: 24 }}>🎭</span>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "#050810", fontSize: 15 }}>Start Practice</div>
            <div style={{ fontSize: 12, color: "#05081099" }}>Expression session</div>
          </div>
        </Link>

        <Link to="/interview" style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00d4ff44"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", fontSize: 15 }}>Interview Mode</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Practice questions</div>
          </div>
        </Link>

        <Link to="/report" style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00d4ff44"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <span style={{ fontSize: 24 }}>📊</span>
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", fontSize: 15 }}>View Report</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Full analytics</div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Sessions" value={report?.totalSessions || 0} sub="Practice sessions" color="var(--cyan)" />
        <StatCard label="Interviews Done" value={interviews.length} sub="Completed interviews" color="#fbbf24" />
        <StatCard label="Speech Fixes" value={report?.totalSpeechCorrections || 0} sub="Grammar corrections" color="#c084fc" />
        <StatCard label="Practice Time" value={report ? Math.floor((report.totalDurationSeconds || 0) / 60) + "m" : "0m"} sub="Total time practiced" color="#34d399" />
      </div>

      {/* Emotion breakdown + Recent interviews */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

        {/* Emotion Breakdown */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 20, fontSize: 16 }}>Emotion Breakdown</h3>
          {report?.expressionPercentages ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {emotions.map(emotion => {
                const pct = parseFloat(report.expressionPercentages[emotion] || 0);
                return (
                  <div key={emotion}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{emotion}</span>
                      <span style={{ color: emotionColors[emotion], fontSize: 13, fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: emotionColors[emotion], borderRadius: 3, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              No session data yet. Start practicing!
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 20, fontSize: 16 }}>Recent Interviews</h3>
          {interviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {interviews.slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#0d1117", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{s.answers?.length || 0} questions answered</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{new Date(s.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: s.totalScore >= 70 ? "#34d399" : s.totalScore >= 50 ? "#fbbf24" : "#f87171" }}>
                    {s.totalScore}/100
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              No interviews yet.{" "}
              <Link to="/interview" style={{ color: "var(--cyan)", textDecoration: "none" }}>Start one now</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
