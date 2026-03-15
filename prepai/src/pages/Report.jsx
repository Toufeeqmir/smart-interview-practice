import { useEffect, useState } from "react";
import API from "../api";

const emotionColors = {
  happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa",
  angry: "#f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c"
};

const Report = () => {
  const [report, setReport] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, interviewsRes] = await Promise.all([
          API.get("/sessions/report"),
          API.get("/interview/history"),
        ]);
        setReport(reportRes.data.report);
        setInterviews(interviewsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div style={{ color: "var(--cyan)", fontFamily: "Syne", fontSize: 18 }}>Loading report...</div>
      </div>
    );
  }

  const emotions = ["happy", "neutral", "sad", "angry", "fear", "disgust", "surprise"];
  const avgScore = interviews.length > 0 ? Math.round(interviews.reduce((a, b) => a + b.totalScore, 0) / interviews.length) : 0;

  const tabs = ["overview", "interviews", "emotions"];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "#fff" }}>Performance Report</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Your complete training analytics</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "var(--bg-card)", padding: 4, borderRadius: 12, width: "fit-content", border: "1px solid var(--border)" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Syne", fontWeight: 600, fontSize: 13, textTransform: "capitalize", transition: "all 0.2s",
              background: activeTab === tab ? "var(--cyan)" : "transparent",
              color: activeTab === tab ? "#050810" : "#94a3b8" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Sessions", value: report?.totalSessions || 0, color: "var(--cyan)" },
              { label: "Interviews Done", value: interviews.length, color: "#fbbf24" },
              { label: "Average Score", value: avgScore + "/100", color: avgScore >= 70 ? "#34d399" : avgScore >= 50 ? "#fbbf24" : "#f87171" },
              { label: "Speech Corrections", value: report?.totalSpeechCorrections || 0, color: "#c084fc" },
              { label: "Practice Time", value: Math.floor((report?.totalDurationSeconds || 0) / 60) + " min", color: "#fb923c" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Emotion percentages */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 24, fontSize: 18 }}>Overall Emotion Distribution</h3>
            {report?.expressionPercentages ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {emotions.map(emotion => {
                  const pct = parseFloat(report.expressionPercentages[emotion] || 0);
                  return (
                    <div key={emotion}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{emotion}</span>
                        <span style={{ color: emotionColors[emotion], fontSize: 13, fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "#1f2937", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: emotionColors[emotion], borderRadius: 4, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 40 }}>
                No session data available yet. Start practicing to see your emotion analytics.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === "interviews" && (
        <div>
          {interviews.length === 0 ? (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
              <div style={{ color: "#64748b", fontSize: 16 }}>No interviews completed yet</div>
              <a href="/interview" style={{ color: "var(--cyan)", fontSize: 14, textDecoration: "none", display: "block", marginTop: 12 }}>Start your first interview</a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {interviews.map((interview, i) => (
                <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#00d4ff33"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ color: "#e2e8f0", fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>Interview Session</div>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{new Date(interview.createdAt).toLocaleDateString()} — {interview.answers?.length || 0} questions</div>
                    </div>
                    <div style={{ fontFamily: "Syne", fontSize: 32, fontWeight: 800, color: interview.totalScore >= 70 ? "#34d399" : interview.totalScore >= 50 ? "#fbbf24" : "#f87171" }}>
                      {interview.totalScore}/100
                    </div>
                  </div>

                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{interview.overallFeedback}</p>

                  {interview.answers?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {interview.answers.map((ans, j) => (
                        <div key={j} style={{ background: "#0d1117", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{ans.question}</span>
                            <span style={{ color: ans.overallScore >= 70 ? "#34d399" : ans.overallScore >= 50 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 700 }}>{ans.overallScore}/100</span>
                          </div>
                          <div style={{ display: "flex", gap: 16 }}>
                            <span style={{ color: "#64748b", fontSize: 12 }}>Confidence: <span style={{ color: "var(--cyan)" }}>{ans.confidenceScore}</span></span>
                            <span style={{ color: "#64748b", fontSize: 12 }}>Grammar: <span style={{ color: "#34d399" }}>{ans.grammarScore}</span></span>
                            <span style={{ color: "#64748b", fontSize: 12 }}>Fillers: <span style={{ color: "#f87171" }}>{ans.fillerWordCount}</span></span>
                            <span style={{ color: "#64748b", fontSize: 12 }}>WPM: <span style={{ color: "#fbbf24" }}>{ans.wordsPerMinute}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emotions Tab */}
      {activeTab === "emotions" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
          <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 24 }}>Emotion Details</h3>
          {report?.expressionTotals ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {emotions.map(emotion => (
                <div key={emotion} style={{ background: "#0d1117", border: `1px solid ${emotionColors[emotion]}33`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>
                    {{ happy: "😊", neutral: "😐", sad: "😢", angry: "😠", fear: "😨", disgust: "🤢", surprise: "😲" }[emotion]}
                  </div>
                  <div style={{ fontFamily: "Syne", fontSize: 24, fontWeight: 800, color: emotionColors[emotion] }}>
                    {report.expressionTotals[emotion] || 0}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize", marginTop: 4 }}>{emotion}</div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{report.expressionPercentages[emotion] || "0.0"}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 40 }}>
              No emotion data available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Report;
