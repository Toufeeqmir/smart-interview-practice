import { useRef, useState, useEffect, useCallback } from "react";
import API from "../api";

const emotionColors = {
  happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa",
  angry:" #f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c"
};

const emotionEmoji = {
  happy: "😊", neutral: "😐", sad: "😢",
  angry: "😠", fear: "😨", disgust: "🤢", surprise: "😲"
};

const Session = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [emotionLog, setEmotionLog] = useState([]);
  const [emotionSummary, setEmotionSummary] = useState({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(t => t.stop());
  };

  const captureFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.8));
  }, []);

  const analyzeFrame = useCallback(async (sid) => {
    try {
      const blob = await captureFrame();
      if (!blob) return;
      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");
      if (sid) formData.append("sessionId", sid);
      const res = await API.post("/expression/analyze", formData);
      const { expression, confidence: conf, face_detected } = res.data;
      if (face_detected && expression) {
        setCurrentEmotion(expression);
        setConfidence(Math.round(conf));
        setEmotionLog(prev => [...prev.slice(-19), { expression, confidence: conf, time: new Date().toLocaleTimeString() }]);
        setEmotionSummary(prev => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
      }
    } catch (err) {
      console.error("Analyze error:", err);
    }
  }, [captureFrame]);

  const startSession = async () => {
    try {
      const res = await API.post("/sessions/start");
      const sid = res.data.session.sessionId;
      setSessionId(sid);
      setStatus("active");
      setEmotionLog([]);
      setEmotionSummary({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
      setElapsed(0);
      setResult(null);
      intervalRef.current = setInterval(() => analyzeFrame(sid), 2000);
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } catch (err) {
      console.error("Start session error:", err);
    }
  };

  const endSession = async () => {
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    setStatus("ending");
    try {
      const res = await API.put(`/sessions/${sessionId}/end`);
      setResult(res.data.session);
      setStatus("done");
    } catch (err) {
      console.error("End session error:", err);
      setStatus("idle");
    }
  };

  const resetSession = () => {
    setStatus("idle");
    setSessionId(null);
    setCurrentEmotion(null);
    setConfidence(0);
    setEmotionLog([]);
    setEmotionSummary({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
    setElapsed(0);
    setResult(null);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const totalDetections = Object.values(emotionSummary).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 28, fontWeight: 800, color: "#fff" }}>Expression Practice</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>AI analyzes your facial emotions in real time</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Camera */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Status overlay */}
            {status === "active" && (
              <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: "pulse-cyan 1s infinite" }} />
                <span style={{ color: "#fff", fontSize: 13, fontFamily: "Syne" }}>LIVE {formatTime(elapsed)}</span>
              </div>
            )}

            {/* Current emotion */}
            {status === "active" && currentEmotion && (
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.8)", borderRadius: 12, padding: "10px 16px", border: `1px solid ${emotionColors[currentEmotion]}44` }}>
                <span style={{ fontSize: 24 }}>{emotionEmoji[currentEmotion]}</span>
                <span style={{ color: emotionColors[currentEmotion], fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginLeft: 8, textTransform: "capitalize" }}>{currentEmotion}</span>
                <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>{confidence}%</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: 20, display: "flex", gap: 12, justifyContent: "center" }}>
            {status === "idle" && (
              <button onClick={startSession} style={{ background: "var(--cyan)", color: "#050810", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 0 20px #00d4ff33" }}>
                Start Session
              </button>
            )}
            {status === "active" && (
              <button onClick={endSession} style={{ background: "#f87171", color: "#fff", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                End Session
              </button>
            )}
            {status === "done" && (
              <button onClick={resetSession} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "#e2e8f0", padding: "12px 32px", borderRadius: 10, fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                New Session
              </button>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Session result */}
          {result && (
            <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff33", borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--cyan)", marginBottom: 16, fontSize: 15 }}>Session Complete</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>Duration</span>
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatTime(result.duration || 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>Dominant Emotion</span>
                  <span style={{ color: emotionColors[result.dominantExpression] || "var(--cyan)", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{result.dominantExpression}</span>
                </div>
              </div>
            </div>
          )}

          {/* Emotion Summary */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, flex: 1 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 16, fontSize: 15 }}>Emotion Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(emotionSummary).map(([emotion, count]) => {
                const pct = totalDetections > 0 ? (count / totalDetections) * 100 : 0;
                return (
                  <div key={emotion}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{emotion}</span>
                      <span style={{ color: emotionColors[emotion], fontSize: 12 }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 4, background: "#1f2937", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: emotionColors[emotion], borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent detections */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 15 }}>Recent</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
              {emotionLog.length === 0 ? (
                <span style={{ color: "#475569", fontSize: 13 }}>No detections yet</span>
              ) : (
                [...emotionLog].reverse().map((log, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: emotionColors[log.expression], fontSize: 13, textTransform: "capitalize" }}>
                      {emotionEmoji[log.expression]} {log.expression}
                    </span>
                    <span style={{ color: "#475569", fontSize: 11 }}>{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
