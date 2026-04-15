import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";

const TECH_KEYWORDS = ["developer","engineer","programmer","architect","data","devops","backend","frontend","fullstack","full stack","ml","ai","cloud","security","mobile","android","ios","qa","sre","systems"];
const isTech = (role) => TECH_KEYWORDS.some(k => role.toLowerCase().includes(k));

const diffColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };
const diffBg    = { easy: "rgba(16,185,129,0.1)", medium: "rgba(245,158,11,0.1)", hard: "rgba(239,68,68,0.1)" };

const PrepLibrary = () => {
  const [role, setRole]       = useState("");
  const [level, setLevel]     = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({});
  const [activeTab, setActiveTab] = useState("technical");
  const [open, setOpen]       = useState(null);

  const showDsa = role.trim() && isTech(role);

  const fetchByCategory = async (category) => {
    if (!role.trim()) { message.warning("Please enter a job role first"); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/prep/questions?category=${category}&role=${encodeURIComponent(role)}&level=${level}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 60000 }
      );

      setAllData(prev => ({
        ...prev,
        [category]: res.data.questions || []
      }));

    } catch (err) {
      console.error(err);
      message.error(`Failed to load ${category} questions`);
    }

    setLoading(false);
  };

  const tabs = [
    { key: "technical", label: "⚡ Technical" },
    { key: "hr", label: "🤝 HR & Behavioral" },
    ...(showDsa ? [{ key: "dsa", label: "🧮 DSA" }] : []),
  ];

  const questions = allData?.[activeTab] || [];

  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      <div className="container" style={{ paddingTop: 88, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="badge badge-indigo" style={{ marginBottom: 14 }}>Preparation Mode</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Prep <span className="g-text">Library</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15 }}>Enter any role, click Generate once — we'll load Technical, HR & DSA (if tech) all at once.</p>
        </div>

        {/* Controls */}
        <div className="card card-p" style={{ marginBottom: 24 }}>
          <div className="pl-controls-grid">
            <div>
              <label className="field-label">Job Role (any role you like)</label>
              <input
                className="field" type="text"
                placeholder="e.g. React Developer, HR Manager, Marketing Lead, Chef…"
                value={role}
                onChange={e => { setRole(e.target.value); setAllData(null); }}
                onKeyDown={e => e.key === "Enter" && fetchByCategory(activeTab)}
              />
            </div>
            <div>
              <label className="field-label">Level</label>
              <select className="field" value={level} onChange={e => setLevel(e.target.value)} style={{ cursor: "pointer", minWidth: 140 }}>
                {["beginner","intermediate","advanced"].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => fetchByCategory(activeTab)} disabled={loading} style={{ height: 46, paddingLeft: 24, paddingRight: 24 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spin-indicator" />
                  Generating all…
                </span>
              ) : "Generate All ✦"}
            </button>
          </div>

          {role.trim() && (
            <div style={{ marginTop: 12, fontSize: 13, color: isTech(role) ? "var(--indigo)" : "var(--muted2)", display: "flex", alignItems: "center", gap: 6 }}>
              {isTech(role) ? "🧮 DSA section will be included (technical role detected)" : "ℹ️ DSA section hidden (non-technical role — HR & Technical only)"}
            </div>
          )}
        </div>

        {/* Tabs */}
        {(allData || loading) && (
          <div className="pl-tabs-row">
            {tabs.map(t => (
              <button key={t.key} onClick={() => {
                setActiveTab(t.key);
                setOpen(null);
                if (!allData?.[t.key]) {
                  fetchByCategory(t.key);
                }
              }} className="btn" style={{
                background: activeTab === t.key ? "rgba(99,102,241,0.12)" : "var(--surface)",
                border: `1.5px solid ${activeTab === t.key ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                color: activeTab === t.key ? "var(--indigo)" : "var(--text2)",
                fontWeight: activeTab === t.key ? 700 : 500,
              }}>
                {t.label}
                {allData?.[t.key]?.length > 0 && (
                  <span className="pl-tab-count">{allData[t.key].length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="pl-loading">
            <div className="pl-spinner" />
            <p style={{ color: "var(--text2)", fontSize: 15 }}>AI is generating all sections at once…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !allData && (
          <div className="card card-p-lg" style={{ textAlign: "center", borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Enter any role and click Generate</div>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>Works for any job — technical or non-technical. All sections generate at once.</p>
          </div>
        )}

        {!loading && allData && questions.length === 0 && (
          <div className="card card-p" style={{ textAlign: "center", color: "var(--muted2)", fontSize: 14 }}>No questions generated for this section. Try again.</div>
        )}

        {/* Questions list */}
        {!loading && questions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {questions.map((q, i) => (
              <div key={i} className="card" style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
                <div className="pl-q-row">
                  <div className="pl-q-num">
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo)" }}>{i + 1}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.5 }}>{q.question}</span>
                  <div className="pl-q-actions">
                    {q.difficulty && (
                      <span className="badge" style={{ background: diffBg[q.difficulty] || "var(--bg3)", color: diffColor[q.difficulty] || "var(--muted)", border: `1px solid ${diffColor[q.difficulty] || "var(--border)"}40`, fontSize: 10 }}>
                        {q.difficulty}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--muted)" }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {open === i && (
                  <div className="pl-answer-panel">
                    <div className="pl-answer-inner">
                      <div className="pl-answer-label">Ideal Answer</div>
                      <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{q.idealAnswer}</p>
                      {q.tags?.length > 0 && (
                        <div className="pl-tags">
                          {q.tags.map(t => <span key={t} className="badge badge-indigo" style={{ fontSize: 11 }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepLibrary;
