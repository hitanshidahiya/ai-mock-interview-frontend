import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Tooltip, Modal } from "antd";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, Cell } from "recharts";
import axios from "axios";

/* ── Circular Gauge ─────────────────────────── */
const Gauge = ({ value, max, label, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 44; const circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--bg3)" strokeWidth="9"/>
        <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }}/>
        <text x="54" y="51" textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">{pct}%</text>
        <text x="54" y="67" textAnchor="middle" fill="var(--muted2)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">{label}</text>
      </svg>
    </div>
  );
};

/* ── Calendar heatmap ───────────────────────── */
const CalendarHeatmap = ({ activity, streak }) => {
  const actMap = {};
  activity.forEach(a => { actMap[a.date] = a.count; });

  // Build 10 weeks × 7 days = 70 cells, arranged as columns (weeks) × rows (days)
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Array.from({ length: 70 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (69 - i));
    const key = d.toISOString().split("T")[0];
    const dow = d.getDay(); // 0=Sun
    const dayName = ["Su","Mo","Tu","We","Th","Fr","Sa"][dow];
    return { key, count: actMap[key] || 0, date: d, dayName };
  });

  // Group into weeks (columns)
  const weeks = [];
  for (let w = 0; w < 10; w++) weeks.push(days.slice(w * 7, w * 7 + 7));

  const cellColor = (n) => {
    if (n === 0) return "hcell-0";
    if (n === 1) return "hcell-1";
    if (n === 2) return "hcell-2";
    return "hcell-3";
  };

  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const first = week[0].date;
    if (first.getDate() <= 7 || wi === 0) {
      monthLabels[wi] = first.toLocaleString("default", { month: "short" });
    } else {
      monthLabels[wi] = "";
    }
  });

  return (
    <div>
      {/* Month labels */}
      <div style={{ display: "flex", gap: 4, marginBottom: 4, paddingLeft: 22 }}>
        {weeks.map((_, wi) => (
          <div key={wi} style={{ width: 14, fontSize: 9, color: "var(--muted)", textAlign: "center", flexShrink: 0 }}>{monthLabels[wi]}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 4 }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
            <div key={d} style={{ width: 14, height: 14, fontSize: 9, color: i % 2 === 0 ? "var(--muted)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d}</div>
          ))}
        </div>
        {/* Cells */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {week.map((day) => (
              <Tooltip key={day.key} title={`${day.key}: ${day.count} interview${day.count !== 1 ? "s" : ""}`}>
                <div className={`hcell ${cellColor(day.count)}`} />
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
        <span>Less</span>
        {["hcell-0","hcell-1","hcell-2","hcell-3"].map(c => <div key={c} className={`hcell ${c}`} style={{ cursor: "default" }} />)}
        <span>More</span>
        <span style={{ marginLeft: "auto", fontWeight: 700, color: "#f97316" }}>{streak} day streak 🔥</span>
      </div>
    </div>
  );
};

/* ── Scores ─────────────────────────────────── */
const scoreColor = s => s >= 8 ? "#10b981" : s >= 5 ? "#f59e0b" : "#ef4444";

const Dashboard = ({ setAuth }) => {
  const [data,       setData]       = useState(null);
  const [history,    setHistory]    = useState([]);
  const [streak,     setStreak]     = useState(null);
  const [activity,   setActivity]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [aiTip,      setAiTip]      = useState(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setAuth(false); navigate("/login"); return; }
      const o = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
      try {
        const [d, h, s, a] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard`, o),
          axios.get(`${import.meta.env.VITE_API_URL}/interview/history`, o),
          axios.get(`${import.meta.env.VITE_API_URL}/streak`, o),
          axios.get(`${import.meta.env.VITE_API_URL}/interview/activity`, o),
        ]);
        setData(d.data); setHistory(h.data); setStreak(s.data); setActivity(a.data);
      } catch (e) {
        if (e.response?.status === 401) { localStorage.removeItem("token"); setAuth(false); navigate("/login"); }
        else message.error("Failed to load dashboard");
      } finally { setLoading(false); }
    };
    load();
  }, [navigate, setAuth]);

  // Re-fetch streak + activity after returning from interview (heatmap update)
  useEffect(() => {
    const handleFocus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const o = { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
      try {
        const [s, a] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/streak`, o),
          axios.get(`${import.meta.env.VITE_API_URL}/interview/activity`, o),
        ]);
        setStreak(s.data); setActivity(a.data);
      } catch {}
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchTip = async () => {
    setTipLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/prep/ai-tip`,
        { role: history[0]?.role || "Software Developer", overallScore: data?.averageScore || 0, totalInterviews: data?.totalInterviews || 0 },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setAiTip(res.data);
    } catch { message.error("Failed to get tips"); }
    setTipLoading(false);
  };

  const fetchDetail = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/interview/${id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setSelected(res.data);
    } catch { message.error("Failed to load"); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--border2)", borderTopColor: "var(--indigo)", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "var(--text2)", fontSize: 14 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const radarData = [
    { skill: "Accuracy",    value: Math.min(100, Math.round(((data?.averageScore||0)/50)*100)) },
    { skill: "Consistency", value: Math.min(100, (data?.completed||0)*20) },
    { skill: "Breadth",     value: Math.min(100, Object.keys(data?.roleStats||{}).length*25) },
    { skill: "Streak",      value: Math.min(100, (streak?.streak||0)*15) },
    { skill: "Growth",      value: Math.min(100, (data?.scoreTrend?.length||0)>1 ? 65 : 30) },
  ];
  const trendData = (data?.scoreTrend||[]).map((s,i) => ({ n:`#${i+1}`, score: s.score }));
  const user = JSON.parse(localStorage.getItem("user")||"{}");

  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      <div className="container" style={{ paddingTop: 88, paddingBottom: 60 }}>

        {/* ── HEADER ROW: title left, streak+heatmap top-right ── */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "flex-start", marginBottom: 28 }}>
          {/* Left: title + action buttons */}
          <div>
            <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 4 }}>Welcome back,</p>
            <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 16 }}>
              {user.name || "Candidate"} <span >👋</span>
            </h1>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/prep")}>📚 Prep Library</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/interview")}>+ New Interview</button>
            </div>
          </div>

          {/* Right: heatmap calendar box */}
          <div className="card card-p" style={{ borderRadius: 18 }}>
            {/* Daily challenge row */}
            {streak?.dailyChallenge && (
              <div
                onClick={() => !streak.dailyChallenge.completed && navigate("/interview", { state: { role: "Software Developer", mode: "text" } })}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)", cursor: streak.dailyChallenge.completed ? "default" : "pointer", borderRadius: 10, padding: "10px 12px", marginBottom: 10, background: streak.dailyChallenge.completed ? "rgba(16,185,129,0.05)" : "rgba(99,102,241,0.05)", border: `1px solid ${streak.dailyChallenge.completed ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"}`, marginBottom: 14, transition: "all 0.2s" }}
                onMouseOver={e => { if (!streak.dailyChallenge.completed) e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                onMouseOut={e => { if (!streak.dailyChallenge.completed) e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{streak.dailyChallenge.completed ? "✅" : "🎯"}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: streak.dailyChallenge.completed ? "#10b981" : "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Daily Challenge</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{streak.dailyChallenge.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{streak.dailyChallenge.description}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span className={streak.dailyChallenge.completed ? "badge badge-green" : "badge badge-indigo"} style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                    {streak.dailyChallenge.completed ? "✓ Done" : "Start →"}
                  </span>
                  {!streak.dailyChallenge.completed && (
                    <span style={{ fontSize: 10, color: "var(--muted2)" }}>click to begin</span>
                  )}
                </div>
              </div>
            )}
            {/* Calendar heatmap */}
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>📅 Activity — Last 70 Days</div>
            <CalendarHeatmap activity={activity} streak={streak?.streak || 0} />
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 14 }}>
          {[
            { label: "Interviews",  val: data?.totalInterviews||0, color: "var(--indigo)", icon: "📝", grad: "var(--grad)" },
            { label: "Best Score",  val: data?.bestScore||0,       color: "#a855f7",       icon: "🏆", grad: "linear-gradient(135deg,#a855f7,#ec4899)" },
            { label: "Avg Score",   val: data?.averageScore||0,    color: "var(--cyan)",   icon: "📊", grad: "var(--grad2)" },
            { label: "Day Streak",  val: `${streak?.streak||0}🔥`, color: "#f97316",       icon: "🔥", grad: "var(--grad-warm)" },
            { label: "Completed",   val: data?.completed||0,       color: "var(--green)",  icon: "✅", grad: "var(--grad-green)" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 12 }}>
          {/* Radar */}
          <div className="card card-p">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>🕸 Skill Radar</div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)"/>
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted2)", fontSize: 10, fontFamily: "Plus Jakarta Sans" }}/>
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={1.5}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Gauges */}
          <div className="card card-p">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>🎯 Performance</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <Gauge value={data?.averageScore||0} max={50} label="Avg"  color="#6366f1"/>
              <Gauge value={data?.bestScore||0}    max={50} label="Best" color="#06b6d4"/>
            </div>
          </div>

          {/* Trend */}
          <div className="card card-p">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>📈 Score Trend</div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trendData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="n" tick={{ fill: "var(--muted2)", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "var(--muted2)", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <RTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13 }}/>
                  <Bar dataKey="score" radius={[5,5,0,0]}>
                    {trendData.map((_,i) => <Cell key={i} fill={i===trendData.length-1 ? "#06b6d4" : "#6366f1"} opacity={i===trendData.length-1 ? 1 : 0.65}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:180, color:"var(--muted2)", fontSize:13 }}>Complete interviews to see trends</div>}
          </div>
        </div>

        {/* ── AI TIPS + ROLES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 12, marginBottom: 12 }}>
          <div className="card card-p">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>💡 AI Coaching</div>
              <button className="btn btn-ghost btn-sm" onClick={fetchTip} disabled={tipLoading}>{tipLoading ? "..." : "Get tips"}</button>
            </div>
            {aiTip ? (
              <div>
                <div style={{ padding: "12px 14px", background: "rgba(6,182,212,0.08)", borderRadius: 10, borderLeft: "3px solid var(--cyan)", marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--text2)", lineHeight: 1.7, margin: 0 }}>"{aiTip.encouragement}"</p>
                </div>
                {(aiTip.tips||[]).map((t,i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2 }}>{i+1}</div>
                    <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, margin: 0 }}>{t}</p>
                  </div>
                ))}
              </div>
            ) : <div style={{ textAlign: "center", padding: "22px 0", color: "var(--muted2)", fontSize: 13 }}>Click "Get tips" for personalized AI coaching</div>}
          </div>

          <div className="card card-p">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🧩 Roles Practiced</div>
            {Object.keys(data?.roleStats||{}).length === 0
              ? <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted2)", fontSize: 13 }}>Practice different roles to see breakdown</div>
              : Object.entries(data.roleStats).map(([role, count]) => (
                <div key={role} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{role}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)" }}>{count}×</span>
                  </div>
                  <div className="prog-track" style={{ height: 6 }}><div className="prog-fill" style={{ width: `${Math.min(100, count*34)}%` }}/></div>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── HISTORY ── */}
        <div className="card card-p">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>📋 Interview History</div>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: 44 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No interviews yet</div>
              <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>Start your first AI interview to see results here</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/interview")}>Start your first interview →</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map(item => (
                <div key={item._id} onClick={() => fetchDetail(item._id)} style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg3)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, transition: "all 0.18s" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{item.role}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge badge-indigo" style={{ fontSize: 10 }}>{item.level}</span>
                      <span className="badge" style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted2)", fontSize: 10 }}>{item.difficulty||"medium"}</span>
                      <span style={{ fontSize: 12, color: "var(--muted2)" }}>{new Date(item.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>
                      {item.overallScore}<span style={{ fontSize: 12, WebkitTextFillColor: "var(--muted2)", fontWeight: 400 }}>/50</span>
                    </div>
                    <span className={`badge ${item.status==="completed" ? "badge-green" : "badge-indigo"}`} style={{ fontSize: 10 }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} width={820}
        title={<span>{selected?.role} — Results</span>}>
        {selected && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge badge-indigo">{selected.level}</span>
              <span className="badge" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--muted2)" }}>{selected.difficulty}</span>
              <span style={{ color: "var(--muted2)", fontSize: 13 }}>{new Date(selected.createdAt).toLocaleString()}</span>
              <span style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {selected.overallScore} / {selected.questions?.length*10}
              </span>
            </div>
            <div className="prog-track" style={{ height: 8, marginBottom: 18 }}><div className="prog-fill" style={{ width: `${Math.round((selected.overallScore/(selected.questions?.length*10))*100)}%` }}/></div>
            {selected.deepDiveFeedback?.summary && (
              <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.07)", borderRadius: 10, borderLeft: "3px solid var(--indigo)", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase", marginBottom: 5 }}>AI Summary</div>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, margin: 0 }}>{selected.deepDiveFeedback.summary}</p>
              </div>
            )}
            {selected.questions?.map((q,i) => (
              <div key={i} style={{ marginBottom: 10, padding: "14px 16px", borderRadius: 11, border: `1px solid ${scoreColor(q.score)}40` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1, marginRight: 12 }}>Q{i+1}. {q.question}</span>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${scoreColor(q.score)}18`, border: `2px solid ${scoreColor(q.score)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: scoreColor(q.score), flexShrink: 0 }}>{q.score}/10</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}><strong>Answer:</strong> {q.userAnswer||"—"}</div>
                <div style={{ fontSize: 12, color: "var(--text2)", borderLeft: `2.5px solid ${scoreColor(q.score)}`, paddingLeft: 10, lineHeight: 1.6 }}>{q.feedback}</div>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ marginTop: 6 }}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
