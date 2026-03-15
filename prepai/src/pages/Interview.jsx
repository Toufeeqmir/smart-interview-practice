import { useState, useRef, useEffect, useCallback } from "react";
import API from "../api";

const emotionColors = {
  happy: "#fbbf24", neutral: "#94a3b8", sad: "#60a5fa",
  angry: "#f87171", fear: "#c084fc", disgust: "#34d399", surprise: "#fb923c"
};

const ScoreBar = ({ label, score, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>{label}</span>
      <span style={{ color, fontSize: 12, fontWeight: 600 }}>{score}/100</span>
    </div>
    <div style={{ height: 5, background: "#1f2937", borderRadius: 3 }}>
      <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3, transition: "width 1s ease" }} />
    </div>
  </div>
);

const Interview = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const [step, setStep] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotionSummary, setEmotionSummary] = useState({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
  const [emotionLog, setEmotionLog] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
  };

  const speakQuestion = (text) => {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9;
    setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis?.speak(u);
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

  const analyzeFrame = useCallback(async () => {
    try {
      const blob = await captureFrame();
      if (!blob) return;
      const fd = new FormData();
      fd.append("image", blob, "frame.jpg");
      const res = await API.post("/expression/analyze", fd);
      const { expression, face_detected } = res.data;
      if (face_detected && expression) {
        setCurrentEmotion(expression);
        setEmotionLog(prev => [...prev, { expression, confidence: res.data.confidence }]);
        setEmotionSummary(prev => ({ ...prev, [expression]: (prev[expression] || 0) + 1 }));
      }
    } catch (err) { console.error(err); }
  }, [captureFrame]);

  const startSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome or Edge for voice input."); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setCurrentAnswer(t);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "5" });
      if (category !== "all") params.append("category", category);
      if (difficulty !== "all") params.append("difficulty", difficulty);

      const [qRes, sRes] = await Promise.all([
        API.get(`/interview/questions?${params.toString()}`),
        API.post("/interview/start"),
      ]);

      const qs = qRes.data.questions;
      if (!qs || qs.length === 0) {
        alert("No questions found. Try different filters.");
        setLoading(false);
        return;
      }

      setQuestions(qs);
      setSessionId(sRes.data.session.sessionId);
      setCurrentIdx(0);
      setAnswers([]);
      setCurrentAnswer("");
      setEmotionSummary({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
      setEmotionLog([]);
      setElapsed(0);
      setStep("question");
      intervalRef.current = setInterval(analyzeFrame, 3000);
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
      setTimeout(() => speakQuestion(qs[0]?.question), 500);
    } catch (err) {
      console.error(err);
      alert("Failed to start. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = (idx, answer, emoSum, emoLog, dur) => {
    const entry = {
      question: questions[idx]?.question,
      category: questions[idx]?.category || "general",
      originalAnswer: answer,
      duration: dur,
      emotionSummary: { ...emoSum },
      emotionLog: [...emoLog],
    };
    setAnswers(prev => {
      const updated = [...prev];
      updated[idx] = entry;
      return updated;
    });
    return entry;
  };

  const goToNext = () => {
    if (!currentAnswer.trim()) { alert("Please provide an answer before continuing."); return; }
    stopSpeechRecognition();
    saveAnswer(currentIdx, currentAnswer, emotionSummary, emotionLog, elapsed);
    setCurrentAnswer("");
    setCurrentEmotion(null);
    setEmotionSummary({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
    setEmotionLog([]);
    setElapsed(0);
    setCurrentIdx(prev => prev + 1);
    setTimeout(() => speakQuestion(questions[currentIdx + 1]?.question), 300);
  };

  const finishInterview = async () => {
    if (!currentAnswer.trim()) { alert("Please provide an answer before finishing."); return; }
    stopSpeechRecognition();
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    const lastAnswer = saveAnswer(currentIdx, currentAnswer, emotionSummary, emotionLog, elapsed);
    setSubmitting(true);
    setStep("submitting");

    try {
      const allAnswers = [...answers];
      allAnswers[currentIdx] = lastAnswer;

      for (const ans of allAnswers) {
        if (ans) await API.post("/interview/answer", { sessionId, ...ans });
      }

      const endRes = await API.put(`/interview/${sessionId}/end`);
      setFinalResult(endRes.data.result);
      setStep("final");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
      setStep("question");
    } finally {
      setSubmitting(false);
    }
  };

  const resetInterview = () => {
    setStep("setup"); setQuestions([]); setCurrentIdx(0);
    setSessionId(null); setAnswers([]); setCurrentAnswer("");
    setCurrentEmotion(null); setFinalResult(null); setElapsed(0);
    setEmotionSummary({ happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, disgust: 0, surprise: 0 });
    setEmotionLog([]);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const totalEmo = Object.values(emotionSummary).reduce((a, b) => a + b, 0);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800, color: "#fff" }}>Interview Practice</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>Answer all questions then receive your full score at the end</p>
      </div>

      {/* Setup */}
      {step === "setup" && (
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Configure Interview</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: "100%", background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}>
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="situational">Situational</option>
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 6 }}>Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  style={{ width: "100%", background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}>
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ background: "#0d1117", borderRadius: 10, padding: 14, marginBottom: 18, border: "1px solid var(--border)" }}>
              {["5 interview questions", "Real time facial emotion tracking", "Voice or text answer input", "Submit all at end for full report"].map((item, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "3px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--cyan)" }}>✓</span>{item}
                </div>
              ))}
            </div>

            <button onClick={startInterview} disabled={loading}
              style={{ width: "100%", background: "var(--cyan)", color: "#050810", padding: "12px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 0 20px #00d4ff33" }}>
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        </div>
      )}

      {/* Question */}
      {step === "question" && questions[currentIdx] && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, transition: "all 0.3s",
                  background: i < currentIdx ? "var(--cyan)" : i === currentIdx ? "#00d4ff55" : "#1f2937" }} />
              ))}
              <span style={{ color: "#64748b", fontSize: 12, whiteSpace: "nowrap", marginLeft: 4 }}>{currentIdx + 1}/{questions.length}</span>
            </div>

            {/* Question */}
            <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff22", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ background: "var(--cyan-dim)", border: "1px solid #00d4ff33", borderRadius: 5, padding: "2px 8px", fontSize: 11, color: "var(--cyan)", textTransform: "capitalize" }}>
                    {questions[currentIdx].category}
                  </span>
                  <span style={{ background: "#1f2937", borderRadius: 5, padding: "2px 8px", fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>
                    {questions[currentIdx].difficulty}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{formatTime(elapsed)}</span>
                  <button onClick={() => speakQuestion(questions[currentIdx].question)}
                    style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", color: isSpeaking ? "var(--cyan)" : "#64748b", fontSize: 12, cursor: "pointer" }}>
                    {isSpeaking ? "Speaking..." : "🔊 Read"}
                  </button>
                </div>
              </div>
              <p style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>
                {questions[currentIdx].question}
              </p>
            </div>

            {/* Answer */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>Your Answer</span>
                <button onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                  style={{ background: isListening ? "#f8717115" : "var(--cyan-dim)", border: `1px solid ${isListening ? "#f8717155" : "#00d4ff33"}`, borderRadius: 6, padding: "4px 10px", color: isListening ? "#f87171" : "var(--cyan)", fontSize: 12, cursor: "pointer" }}>
                  {isListening ? "Stop" : " Speak"}
                </button>
              </div>
              <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer or click Speak to use your voice..."
                rows={5}
                style={{ width: "100%", background: "#0d1117", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}
              />
              {isListening && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", animation: "pulse-cyan 1s infinite" }} />
                  <span style={{ color: "#f87171", fontSize: 12 }}>Listening...</span>
                </div>
              )}

              {/* Answer tracker */}
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, fontFamily: "Syne",
                    background: i < currentIdx ? "var(--cyan)" : i === currentIdx ? "#00d4ff22" : "#1f2937",
                    color: i < currentIdx ? "#050810" : i === currentIdx ? "var(--cyan)" : "#64748b",
                    border: i === currentIdx ? "1px solid #00d4ff55" : "1px solid transparent" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {currentIdx < questions.length - 1 ? (
                <button onClick={goToNext} disabled={!currentAnswer.trim()}
                  style={{ flex: 1, background: currentAnswer.trim() ? "var(--cyan)" : "#1f2937", color: currentAnswer.trim() ? "#050810" : "#64748b", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, border: "none", cursor: currentAnswer.trim() ? "pointer" : "not-allowed" }}>
                  Next Question →
                </button>
              ) : (
                <button onClick={finishInterview} disabled={!currentAnswer.trim()}
                  style={{ flex: 1, background: currentAnswer.trim() ? "#34d399" : "#1f2937", color: currentAnswer.trim() ? "#050810" : "#64748b", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, border: "none", cursor: currentAnswer.trim() ? "pointer" : "not-allowed" }}>
                  Finish & Get Score
                </button>
              )}
            </div>
          </div>

          {/* Camera panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "#000" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {currentEmotion && (
                  <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.85)", borderRadius: 6, padding: "3px 8px" }}>
                    <span style={{ color: emotionColors[currentEmotion], fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{currentEmotion}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 14 }}>
              <div style={{ color: "#64748b", fontSize: 10, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Live Emotions</div>
              {Object.entries(emotionSummary).map(([em, count]) => {
                const pct = totalEmo > 0 ? (count / totalEmo) * 100 : 0;
                return (
                  <div key={em} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize" }}>{em}</span>
                      <span style={{ color: emotionColors[em], fontSize: 11 }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 3, background: "#1f2937", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: emotionColors[em], borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submitting spinner */}
      {step === "submitting" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Analyzing your answers...</p>
        </div>
      )}

      {/* Final Result */}
      {step === "final" && finalResult && (
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid #00d4ff22", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 14 }}>
            <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Final Score</p>
            <div style={{ fontFamily: "Syne", fontSize: 52, fontWeight: 800, lineHeight: 1, color: finalResult.totalScore >= 70 ? "#34d399" : finalResult.totalScore >= 50 ? "#fbbf24" : "#f87171" }}>
              {finalResult.totalScore}
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>out of 100</div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14, lineHeight: 1.6, maxWidth: 460, margin: "14px auto 0" }}>{finalResult.overallFeedback}</p>
          </div>

          {finalResult.answers?.length > 0 && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 22, marginBottom: 14 }}>
              <h3 style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Question Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {finalResult.answers.map((ans, i) => (
                  <div key={i} style={{ background: "#0d1117", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 500, flex: 1, paddingRight: 12 }}>{ans.question}</span>
                      <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", color: ans.overallScore >= 70 ? "#34d399" : ans.overallScore >= 50 ? "#fbbf24" : "#f87171" }}>
                        {ans.overallScore}/100
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <ScoreBar label="Confidence" score={ans.confidenceScore} color="var(--cyan)" />
                      <ScoreBar label="Grammar" score={ans.grammarScore} color="#34d399" />
                      <ScoreBar label="Speech Pace" score={ans.speechScore} color="#fbbf24" />
                      <ScoreBar label="Filler Words" score={ans.fillerScore} color="#c084fc" />
                    </div>
                    {ans.fillerWords?.length > 0 && (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                        {ans.fillerWords.map((w, j) => (
                          <span key={j} style={{ background: "#f8717115", border: "1px solid #f8717133", borderRadius: 4, padding: "2px 7px", color: "#f87171", fontSize: 11 }}>{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={resetInterview}
              style={{ flex: 1, background: "var(--cyan)", color: "#050810", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              Practice Again
            </button>
            <button onClick={() => window.location.href = "/report"}
              style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border)", color: "#e2e8f0", padding: "11px", borderRadius: 8, fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              View Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
