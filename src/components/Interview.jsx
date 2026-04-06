import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const ROLE_SUGGESTIONS = [
  "React Developer","Node.js Developer","Full Stack Developer","Python Developer",
  "Data Engineer","DevOps Engineer","Product Manager","Android Developer",
  "ML Engineer","Backend Developer","Frontend Developer","Java Developer",
  "HR Manager","Marketing Manager","Sales Executive","Content Writer",
  "UI/UX Designer","Business Analyst","Data Analyst","Cloud Engineer",
];

const Interview = () => {
  const [mode, setMode]           = useState(null);
  const [stage, setStage]         = useState("setup");
  const [loading, setLoading]     = useState(false);
  const [thinking, setThinking]   = useState(false);
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [idx, setIdx]             = useState(0);
  const [result, setResult]       = useState(null);
  const [listening, setListening] = useState(false);
  const [showCode, setShowCode]   = useState(false);
  const [code, setCode]           = useState("// Write your code here\n");
  const [roleInput, setRoleInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const recRef      = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  // Pre-fill role if coming from daily challenge
  useEffect(() => {
    if (location.state?.role) setRoleInput(location.state.role);
    if (location.state?.mode) setMode(location.state.mode);
  }, [location.state]);

  useEffect(() => () => recRef.current?.stop(), []);

  const filteredSuggestions = roleInput.length > 0
    ? ROLE_SUGGESTIONS.filter(r => r.toLowerCase().includes(roleInput.toLowerCase())).slice(0, 6)
    : [];

  // ── Voice — fixed: only use the LATEST final result, don't concat old ones ──
  const startSpeech = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { message.error("Speech recognition not supported in this browser. Use Chrome."); return; }

    // Stop any existing session first
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }

    const r = new SR();
    r.continuous      = true;
    r.interimResults  = true;
    r.lang            = "en-US";
    r.maxAlternatives = 1;

    let finalTranscript = answers[idx] || "";
    let interimTranscript = "";

    r.onresult = (e) => {
      interimTranscript = "";
      // Process only new results since last event
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      // Show final + interim to user
      setAnswer(idx, finalTranscript + (interimTranscript ? " " + interimTranscript : ""));
    };

    r.onspeechend = () => {
      // Save only final when speech pauses
      setAnswer(idx, finalTranscript);
    };

    r.onerror = (e) => {
      console.error("Speech error:", e.error);
      if (e.error === "not-allowed") message.error("Microphone access denied. Please allow mic access.");
      else if (e.error === "no-speech") message.warning("No speech detected. Try speaking louder.");
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      // Save final transcript when session ends
      setAnswer(idx, finalTranscript);
    };

    r.start();
    recRef.current = r;
    setListening(true);
  };

  const stopSpeech = () => {
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
    setListening(false);
  };

  const setAnswer = (i, v) => setAnswers(a => { const u = [...a]; u[i] = v; return u; });

  const onStart = async (e) => {
    e.preventDefault();
    const fd  = new FormData(e.target);
    const role = roleInput.trim() || fd.get("role");
    if (!role) { message.warning("Please enter a job role"); return; }

    setLoading(true); setThinking(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/interview/start`,
        { role, level: fd.get("level"), difficulty: fd.get("difficulty") },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setQuestions(res.data.questions);
      setInterviewId(res.data.interviewId);
      setAnswers(new Array(res.data.questions.length).fill(""));
      setIdx(0); setStage("questions");
      message.success("Interview started! Answer each question carefully.");
    } catch (err) { message.error(err.response?.data?.message || "Failed to start interview"); }
    setLoading(false); setThinking(false);
  };

  const handleNext = () => {
    if (!answers[idx]?.trim()) { message.warning("Please write an answer before continuing"); return; }
    stopSpeech();
    setIdx(i => i + 1);
    setShowCode(false);
    setCode("// Write your code here\n");
  };

  const handleSubmit = async () => {
    if (!answers[idx]?.trim()) { message.warning("Please write an answer before submitting"); return; }
    stopSpeech(); setLoading(true); setThinking(true);
    try {
      const token = localStorage.getItem("token");
      const finalAnswers = [...answers];
      if (showCode && code.trim() !== "// Write your code here\n") {
        finalAnswers[idx] += `\n\nCode:\n${code}`;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/interview/submit`,
        { interviewId, answers: finalAnswers },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setResult(res.data); setStage("results");
    } catch (err) { message.error(err.response?.data?.message || "Failed to submit"); }
    setLoading(false); setThinking(false);
  };

  const reset = () => {
    setStage("setup"); setMode(null); setResult(null);
    setQuestions([]); setAnswers([]); setShowCode(false);
    setRoleInput("");
  };

  const scoreColor = s => s >= 8 ? "#10b981" : s >= 5 ? "#f59e0b" : "#ef4444";
  const scoreBg    = s => s >= 8 ? "rgba(16,185,129,0.1)" : s >= 5 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";

  /* ── Mode picker ── */
  if (!mode) return (
    <div className="page mesh-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ textAlign: "center", maxWidth: 600, width: "100%", padding: "0 20px", position: "relative", zIndex: 1 }}>
        <div className="badge badge-indigo" style={{ marginBottom: 18 }}>Interview Mode</div>
        <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 10 }}>
          Choose your <span className="g-text">style</span>
        </h1>
        <p style={{ color: "var(--text2)", marginBottom: 44, fontSize: 16 }}>How do you want to practice today?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { key: "text",  icon: "⌨️", title: "Text Mode",  desc: "Type your answers. Fast and focused for daily practice." },
            { key: "voice", icon: "🎤", title: "Voice Mode", desc: "Speak aloud with your mic. The real interview experience." },
          ].map(m => (
            <div key={m.key} onClick={() => setMode(m.key)} className="card card-p-lg" style={{ cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>{m.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{m.title}</div>
              <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Setup — Mission Control ── */
  if (stage === "setup") return (
    <div className="page mesh-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 500, padding: "0 20px", position: "relative", zIndex: 1 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)} style={{ marginBottom: 18 }}>← Back</button>
        <div className="card" style={{ padding: 44, borderRadius: 28, boxShadow: "var(--shadow-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              {mode === "voice" ? "🎤" : "⌨️"}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>Mission Control</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>{mode === "voice" ? "Voice" : "Text"} interview setup</div>
            </div>
          </div>

          <form onSubmit={onStart} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* ── Free-text role input with suggestions ── */}
            <div style={{ position: "relative" }}>
              <label className="field-label">🏢 Job Role (type anything)</label>
              <input
                className="field"
                type="text"
                placeholder="e.g. React Developer, HR Manager, Chef…"
                value={roleInput}
                onChange={e => { setRoleInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
                required
              />
              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface)", border: "1.5px solid var(--border2)", borderRadius: '10px', boxShadow: "var(--shadow-lg)", marginTop: 4, overflow: "hidden" }}>
                  {filteredSuggestions.map(s => (
                    <div key={s} onMouseDown={() => { setRoleInput(s); setShowSuggestions(false); }}
                      style={{ padding: "10px 14px", fontSize: 14, color: "var(--text2)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.background = "var(--surface2)"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >{s}</div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="field-label">📈 Level</label>
                <select name="level" className="field" style={{ cursor: "pointer" }}>
                  {["beginner","intermediate","advanced"].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">⚡ Difficulty</label>
                <select name="difficulty" className="field" style={{ cursor: "pointer" }}>
                  {["easy","medium","hard"].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", height: 50, fontSize: 15, borderRadius: 13, marginTop: 4 }}>
              {loading
                ? <><span style={{ width: 15, height: 15, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Generating questions…</>
                : "Start Interview →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  /* ── Results ── */
  if (stage === "results" && result) {
    const maxScore = questions.length * 10;
    const pct = Math.round((result.overallScore / maxScore) * 100);
    const dd  = result.deepDiveFeedback;
    return (
      <div className="page" style={{ background: "var(--bg)" }}>
        <div className="container" style={{ paddingTop: 88, paddingBottom: 60, maxWidth: 820 }}>
          <div className="card" style={{ padding: "44px 36px", textAlign: "center", marginBottom: 20, borderRadius: 28, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : "💪"}</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>Interview Complete!</h2>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 18 }}>
              <span className="g-text" style={{ fontSize: 68, fontWeight: 800, lineHeight: 1 }}>{result.overallScore}</span>
              <span style={{ fontSize: 22, color: "var(--muted2)" }}>/ {maxScore}</span>
            </div>
            <div style={{ width: "50%", margin: "0 auto 24px" }}>
              <div className="prog-track" style={{ height: 10 }}><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg" onClick={reset}>New Interview</button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("/dashboard")}>View Dashboard</button>
            </div>
          </div>

          {dd && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {dd.strengths?.length > 0 && (
                <div className="card card-p" style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>✅ Strengths</div>
                  {dd.strengths.map((s,i) => <p key={i} style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 6px", display: "flex", gap: 8 }}><span style={{ color: "#10b981" }}>•</span>{s}</p>)}
                </div>
              )}
              {dd.areasToImprove?.length > 0 && (
                <div className="card card-p" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>📈 Improve</div>
                  {dd.areasToImprove.map((s,i) => <p key={i} style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 6px", display: "flex", gap: 8 }}><span style={{ color: "#ef4444" }}>•</span>{s}</p>)}
                </div>
              )}
              {dd.fillerWordCount > 0 && (
                <div className="card card-p" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.04)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>🗣 Filler Words</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: "#f59e0b", lineHeight: 1, marginBottom: 4 }}>{dd.fillerWordCount}</div>
                  <p style={{ fontSize: 12, color: "var(--text2)", margin: 0 }}>Detected: {dd.fillerWords?.join(", ")}</p>
                </div>
              )}
              {dd.summary && (
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>📋 Summary</div>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, margin: 0 }}>{dd.summary}</p>
                </div>
              )}
            </div>
          )}

          {result.questions?.map((q, i) => (
            <div key={i} className="card card-p" style={{ marginBottom: 12, borderColor: `${scoreColor(q.score)}40` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", flex: 1, marginRight: 16, lineHeight: 1.5 }}>Q{i+1}. {q.question}</span>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: scoreBg(q.score), border: `2px solid ${scoreColor(q.score)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: scoreColor(q.score), flexShrink: 0 }}>{q.score}/10</div>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "9px 12px", marginBottom: 8, fontSize: 13, color: "var(--text2)" }}>
                <strong>Answer: </strong>{q.userAnswer || "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)", borderLeft: `3px solid ${scoreColor(q.score)}`, paddingLeft: 12, lineHeight: 1.7 }}>{q.feedback}</div>
              {result.deepDiveFeedback?.improvedAnswers?.find(ia => ia.question === q.question) && (
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(6,182,212,0.07)", borderLeft: "3px solid var(--cyan)", fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 4 }}>Improved Answer</span>
                  {result.deepDiveFeedback.improvedAnswers.find(ia => ia.question === q.question).improvedAnswer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Questions HUD ── */
  const progress = Math.round((idx / questions.length) * 100);
  return (
    <div className="page" style={{ background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "80px 24px 40px" }}>
      <div style={{ width: "100%", maxWidth: 700 }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Question {idx+1} of {questions.length}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo)" }}>{progress}% complete</span>
          </div>
          <div className="prog-track" style={{ height: 8 }}><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="card" style={{ padding: "36px 38px", borderRadius: 24, boxShadow: "var(--shadow-lg)" }}>
          {thinking ? (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "2px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 18px", animation: "shimmer 2s ease-in-out infinite" }}>🤖</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>AI is analysing…</div>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>Generating your deep-dive report</p>
            </div>
          ) : (<>
            <div style={{ background: "rgba(99,102,241,0.07)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, borderLeft: "4px solid var(--indigo)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Interview Question</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{questions[idx]?.question}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCode(!showCode)} style={{ fontSize: 12, color: showCode ? "var(--indigo)" : undefined, borderColor: showCode ? "rgba(99,102,241,0.4)" : undefined }}>
                {showCode ? "Hide" : "📝 Show"} Code Editor
              </button>
            </div>

            {showCode && (
              <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--border2)" }}>
                <div style={{ background: "#161b22", padding: "8px 14px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid #30363d" }}>
                  {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  <span style={{ fontSize: 12, color: "#8b949e", marginLeft: 8 }}>solution.js</span>
                </div>
                <textarea className="code-area" value={code} onChange={e => setCode(e.target.value)} spellCheck={false} />
              </div>
            )}

            {mode === "voice" ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div className={`voice-btn ${listening ? "on" : ""}`} onClick={listening ? stopSpeech : startSpeech}>
                    <span style={{ fontSize: 30 }}>{listening ? "⏸" : "🎤"}</span>
                  </div>
                  <p style={{ fontSize: 13, color: listening ? "var(--pink)" : "var(--muted2)", fontWeight: listening ? 600 : 400, margin: "12px 0 0" }}>
                    {listening ? "● Recording — click to stop" : "Click mic to start speaking"}
                  </p>
                  {listening && (
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>
                      Speak clearly • Chrome works best
                    </p>
                  )}
                </div>
                {/* Editable transcript — user can also type to fix mistakes */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>
                    Transcript {listening ? <span style={{ color: "var(--pink)" }}>(live)</span> : "(edit if needed)"}
                  </div>
                  <textarea
                    className="field"
                    rows={4}
                    placeholder="Your spoken answer will appear here. You can also type to correct it."
                    value={answers[idx]}
                    onChange={e => setAnswer(idx, e.target.value)}
                    style={{ resize: "vertical", lineHeight: 1.7, minHeight: 100 }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                className="field"
                rows={5}
                placeholder="Type your answer here…"
                value={answers[idx]}
                onChange={e => setAnswer(idx, e.target.value)}
                style={{ marginBottom: 18, resize: "vertical", lineHeight: 1.7, minHeight: 130 }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge badge-indigo" style={{ fontSize: 11 }}>{mode === "voice" ? "🎤 Voice" : "⌨️ Text"}</span>
                <span className="badge" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--muted2)", fontSize: 11 }}>Q{idx+1}/{questions.length}</span>
              </div>
              {idx < questions.length - 1
                ? <button className="btn btn-primary" onClick={handleNext}>Next →</button>
                : <button className="btn btn-primary" disabled={loading} onClick={handleSubmit} style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", border: "none" }}>
                    {loading ? "Analysing..." : "Submit & Analyse ✓"}
                  </button>
              }
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
};

export default Interview;
