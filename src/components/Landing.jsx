import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "⚡", title: "AI Question Engine", desc: "Gemini generates role-specific, difficulty-calibrated questions every session.", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { icon: "🎤", title: "Voice Mode",          desc: "Speak your answers aloud. Web Speech API transcribes and scores live.",        color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  { icon: "🧠", title: "Deep Analysis",       desc: "Filler word count, improved answers, strengths & areas to improve.",          color: "#f059b0", bg: "rgba(240,89,176,0.1)" },
  { icon: "📚", title: "Prep Library",        desc: "HR, Technical & DSA banks with AI ideal answers. Any role you choose.",       color: "#06b6d4", bg: "rgba(6,182,212,0.1)"  },
  { icon: "📊", title: "Skill Analytics",     desc: "Radar charts, score trends, confidence gauges & 70-day streak heatmap.",      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { icon: "🔥", title: "Daily Streaks",       desc: "Daily challenges, streak tracking & AI coaching tips based on your data.",    color: "#f97316", bg: "rgba(249,115,22,0.1)" },
];

const steps = [
  { num: "01", icon: "🎯", title: "Configure", desc: "Enter any role — technical or non-technical. Set your level and difficulty. The AI persona adapts to match." },
  { num: "02", icon: "💬", title: "Practice",  desc: "Answer AI questions by typing or speaking. A built-in code editor slides in for technical rounds." },
  { num: "03", icon: "📈", title: "Improve",   desc: "Get a full report: per-question scores, filler word count, and AI-improved answer suggestions." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="page">

      {/* ── HERO ── */}
      <section className="mesh-bg" style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        {/* Subtle grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.6, pointerEvents: "none" }} />

        <div className="container" style={{ paddingTop: 60, paddingBottom: 80, position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            {/* Left copy */}
            <div>
              <div className="badge badge-indigo anim-up" style={{ marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--indigo)", display: "inline-block" }} />
                AI-powered interview coaching
              </div>

              <h1 className="anim-up-1" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 22, color: "var(--text)" }}>
                Land your{" "}<span className="g-text">dream role</span>
                <br />with AI practice
              </h1>

              <p className="anim-up-2" style={{ fontSize: 17, color: "var(--text2)", lineHeight: 1.75, maxWidth: 430, marginBottom: 36 }}>
                Practice with AI-generated interview questions, get scored instantly, and track improvement with professional analytics — free.
              </p>

              <div className="anim-up-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 52 }}>
                <button className="btn btn-primary btn-xl" onClick={() => navigate("/register")}>
                  Start for free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="btn btn-secondary btn-xl" onClick={() => navigate("/login")}>Sign in</button>
              </div>

              <div className="anim-up-4" style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                {[["Any role", "Technical or non-technical"], ["3 modes", "Text, voice, code editor"], ["70 days", "Activity heatmap tracking"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--indigo)", lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — UI preview */}
            <div className="anim-float anim-up-2" style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -32, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
              <div className="card" style={{ padding: 24, borderRadius: 24, boxShadow: "var(--shadow-lg)" }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 20, alignItems: "center" }}>
                  {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
                  <div style={{ flex: 1, height: 22, background: "var(--bg3)", borderRadius: 6, marginLeft: 10 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[["12","Interviews","#6366f1"],["42","Avg Score","#a855f7"],["7 🔥","Streak","#f059b0"]].map(([v,l,c]) => (
                    <div key={l} style={{ background: "var(--bg3)", borderRadius: 12, padding: "14px 10px", textAlign: "center", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted2)", marginBottom: 10 }}>Score trend</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 52 }}>
                    {[30,44,36,54,42,60,50,68,56,78].map((h,i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0", background: i===9 ? "var(--grad)" : "rgba(99,102,241,0.22)" }} />
                    ))}
                  </div>
                </div>
                <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: 12, padding: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Current Question</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>Explain the difference between useCallback and useMemo in React…</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <div style={{ height: 6, borderRadius: 100, background: "var(--grad)", width: "60%" }} />
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Q3 / 5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" style={{ background: "var(--bg2)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="badge badge-purple" style={{ marginBottom: 14 }}>How it works</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 12 }}>
              Three steps to <span className="g-text">interview-ready</span>
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>From zero to confident in one session.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {steps.map((s) => (
              <div key={s.num} className="fcard" style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 18px", boxShadow: "0 4px 18px rgba(99,102,241,0.35)" }}>{s.icon}</div>
                <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--indigo)", background: "rgba(99,102,241,0.1)", padding: "3px 10px", borderRadius: 100, marginBottom: 10 }}>{s.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — proper bento ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="badge badge-pink" style={{ marginBottom: 14 }}>Features</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 12 }}>
              Everything you need to <span className="g-text">succeed</span>
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>One complete AI interview coaching platform.</p>
          </div>

          {/* Row 1: big left + small right */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="fcard" style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: features[0].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${features[0].color}30` }}>{features[0].icon}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{features[0].title}</h3>
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65, margin: 0 }}>{features[0].desc}</p>
              </div>
            </div>
            <div className="fcard">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: features[1].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, border: `1px solid ${features[1].color}30` }}>{features[1].icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{features[1].title}</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, margin: 0 }}>{features[1].desc}</p>
            </div>
          </div>

          {/* Row 2: three equal */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            {features.slice(2, 5).map(f => (
              <div key={f.title} className="fcard">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, border: `1px solid ${f.color}30` }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Row 3: small left + big right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div className="fcard">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: features[5].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, border: `1px solid ${features[5].color}30` }}>{features[5].icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{features[5].title}</h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, margin: 0 }}>{features[5].desc}</p>
            </div>
            {/* Results preview mini */}
            <div className="fcard" style={{ background: "var(--grad-soft)", borderColor: "rgba(99,102,241,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>After every interview</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Deep-dive AI report</div>
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>42<span style={{ fontSize: 16, WebkitTextFillColor: "var(--muted)", fontWeight: 400 }}>/50</span></div>
              </div>
              {[["Accuracy", 88, "var(--indigo)"], ["Communication", 74, "var(--purple)"], ["Depth", 80, "var(--pink)"]].map(([l, v, c]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{v}%</span>
                  </div>
                  <div className="prog-track" style={{ height: 6 }}><div className="prog-fill" style={{ width: `${v}%`, background: c }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background: "var(--bg2)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto", padding: "72px 48px", background: "var(--grad-soft)", borderRadius: 32, border: "1px solid rgba(99,102,241,0.2)", boxShadow: "var(--shadow-lg)" }}>
            <div className="badge badge-indigo" style={{ marginBottom: 22 }}>Free forever</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
              Ready to ace your <span className="g-text">interview?</span>
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
              Practice with real AI questions, get scored instantly, and build the confidence to land your dream role.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-xl" onClick={() => navigate("/register")}>
                Create free account
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn btn-secondary btn-xl" onClick={() => navigate("/login")}>Sign in</button>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />
      <div style={{ padding: "28px", textAlign: "center" }}>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>© 2025 MockAI · Built with MERN + Gemini AI</span>
      </div>
    </div>
  );
};

export default Landing;
