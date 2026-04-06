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
  const [allData, setAllData] = useState(null); // { technical, hr, dsa }
  const [activeTab, setActiveTab] = useState("technical");
  const [open, setOpen]       = useState(null);

  const showDsa = role.trim() && isTech(role);

  const fetchAll = async () => {
    if (!role.trim()) { message.warning("Please enter a job role first"); return; }
    setLoading(true); setAllData(null); setOpen(null);
    try {
      const token = localStorage.getItem("token");
      const opts = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
      const cats = ["technical", "hr", ...(isTech(role) ? ["dsa"] : [])];
      const results = await Promise.all(
        cats.map(c =>
          axios.get(`${import.meta.env.VITE_API_URL}/prep/questions?category=${c}&role=${encodeURIComponent(role)}&level=${level}`, opts)
            .then(r => ({ cat: c, questions: r.data.questions || [] }))
            .catch(() => ({ cat: c, questions: [] }))
        )
      );
      const data = {};
      results.forEach(r => { data[r.cat] = r.questions; });
      setAllData(data);
      setActiveTab("technical");
    } catch { message.error("Failed to generate questions"); }
    setLoading(false);
  };

  const tabs = [
    { key: "technical", label: "⚡ Technical" },
    { key: "hr",        label: "🤝 HR & Behavioral" },
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "flex-end" }}>
            <div>
              <label className="field-label">Job Role (any role you like)</label>
              <input
                className="field"
                type="text"
                placeholder="e.g. React Developer, HR Manager, Marketing Lead, Chef…"
                value={role}
                onChange={e => { setRole(e.target.value); setAllData(null); }}
                onKeyDown={e => e.key === "Enter" && fetchAll()}
              />
            </div>
            <div>
              <label className="field-label">Level</label>
              <select className="field" value={level} onChange={e => setLevel(e.target.value)} style={{ cursor: "pointer", minWidth: 140 }}>
                {["beginner","intermediate","advanced"].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchAll} disabled={loading} style={{ height: 46, paddingLeft: 24, paddingRight: 24 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Generating all…
                </span>
              ) : "Generate All ✦"}
            </button>
          </div>

          {/* DSA note */}
          {role.trim() && (
            <div style={{ marginTop: 12, fontSize: 13, color: isTech(role) ? "var(--indigo)" : "var(--muted2)", display: "flex", alignItems: "center", gap: 6 }}>
              {isTech(role) ? "🧮 DSA section will be included (technical role detected)" : "ℹ️ DSA section hidden (non-technical role — HR & Technical only)"}
            </div>
          )}
        </div>

        {/* Tabs */}
        {(allData || loading) && (
          <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); setOpen(null); }} className="btn" style={{ background: activeTab === t.key ? "rgba(99,102,241,0.12)" : "var(--surface)", border: `1.5px solid ${activeTab === t.key ? "rgba(99,102,241,0.4)" : "var(--border)"}`, color: activeTab === t.key ? "var(--indigo)" : "var(--text2)", fontWeight: activeTab === t.key ? 700 : 500, position: "relative" }}>
                {t.label}
                {allData?.[t.key]?.length > 0 && (
                  <span style={{ marginLeft: 6, background: "var(--grad)", color: "#fff", borderRadius: 100, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{allData[t.key].length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border2)", borderTopColor: "var(--indigo)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
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

        {/* Questions list */}
        {!loading && allData && questions.length === 0 && (
          <div className="card card-p" style={{ textAlign: "center", color: "var(--muted2)", fontSize: 14 }}>No questions generated for this section. Try again.</div>
        )}

        {!loading && questions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {questions.map((q, i) => (
              <div key={i} className="card" style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
                <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo)" }}>{i + 1}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.5 }}>{q.question}</span>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
                    {q.difficulty && (
                      <span className="badge" style={{ background: diffBg[q.difficulty] || "var(--bg3)", color: diffColor[q.difficulty] || "var(--muted)", border: `1px solid ${diffColor[q.difficulty] || "var(--border)"}40`, fontSize: 10 }}>
                        {q.difficulty}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--muted)" }}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {open === i && (
                  <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--border)", background: "var(--bg3)" }}>
                    <div style={{ paddingTop: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Ideal Answer</div>
                      <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{q.idealAnswer}</p>
                      {q.tags?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
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
