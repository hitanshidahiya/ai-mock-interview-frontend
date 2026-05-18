import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Tooltip, Modal } from "antd";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  Bar, BarChart, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RTooltip, Cell,
} from "recharts";
import axios from "axios";

/* ── Date helpers ── */
const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const parseLocalDate = (str) => {
  const [y, m, d] = str.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

/* ── Circular Gauge ── */
const Gauge = ({ value, max, label, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--bg3)" strokeWidth="9" />
        <circle
          cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="54" y="51" textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">{pct}%</text>
        <text x="54" y="67" textAnchor="middle" fill="var(--muted2)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">{label}</text>
      </svg>
    </div>
  );
};

/* ── LeetCode-style Calendar Heatmap ── */
const CalendarHeatmap = ({ activity, streak }) => {
  const actMap = {};
  (activity || []).forEach((a) => {
    const key = formatDateKey(parseLocalDate(a.date));
    actMap[key] = a.count;
  });

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);

  const startSunday = new Date(start);
  startSunday.setDate(startSunday.getDate() - startSunday.getDay());

  const allDays = [];
  for (let d = new Date(startSunday); d <= today; d.setDate(d.getDate() + 1)) {
    const copy = new Date(d);
    allDays.push({
      key: formatDateKey(copy),
      date: copy,
      count: actMap[formatDateKey(copy)] || 0,
      inRange: copy >= start && copy <= today,
    });
  }

  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) weeks.push(allDays.slice(i, i + 7));

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstInRange = week.find(d => d.inRange);
    if (!firstInRange) return;
    const m = firstInRange.date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: MONTHS[m], col: wi });
      lastMonth = m;
    }
  });

  const cellColor = (n) => {
    if (n === 0) return "hcell-0";
    if (n === 1) return "hcell-1";
    if (n === 2) return "hcell-2";
    if (n === 3) return "hcell-3";
    return "hcell-4";
  };

  const CELL = 13;
  const GAP = 3;
  const COL_W = CELL + GAP;
  const DAY_LABEL_W = 28;
  const totalW = DAY_LABEL_W + weeks.length * COL_W;

  return (
    <div className="heatmap-card">
      <div className="heatmap-scroll">
        <div style={{ width: totalW, minWidth: totalW }}>

          {/* Month labels */}
          <div className="relative h-[18px]" style={{ marginLeft: DAY_LABEL_W }}>
            {monthLabels.map((ml, i) => (
              <span
                key={i}
                className="absolute text-[11px] font-semibold whitespace-nowrap leading-[18px]"
                style={{ left: ml.col * COL_W, color: "var(--muted2)" }}
              >
                {ml.label}
              </span>
            ))}
          </div>

          {/* Grid body */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col flex-shrink-0 pt-px" style={{ width: DAY_LABEL_W }}>
              {DAY_LABELS.map((lb, i) => (
                <div
                  key={i}
                  className="text-[10px] text-right pr-[6px]"
                  style={{
                    height: CELL,
                    marginBottom: i < 6 ? GAP : 0,
                    color: "var(--muted2)",
                    lineHeight: `${CELL}px`,
                    visibility: i % 2 === 1 ? "visible" : "hidden",
                  }}
                >
                  {lb}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((day, di) => (
                    <Tooltip
                      key={di}
                      title={
                        day.inRange
                          ? `${day.key}: ${day.count} interview${day.count !== 1 ? "s" : ""}`
                          : undefined
                      }
                    >
                      <div
                        className={`hcell ${!day.inRange ? "hcell-hidden" : cellColor(day.count)} flex-shrink-0`}
                        style={{ width: CELL, height: CELL }}
                      />
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend mt-[10px]">
            <span>Less</span>
            {["hcell-0","hcell-1","hcell-2","hcell-3","hcell-4"].map((c) => (
              <div key={c} className={`hcell ${c}`} style={{ width: CELL, height: CELL }} />
            ))}
            <span>More</span>
            <span className="heatmap-legend-streak">{streak} day streak 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Score color ── */
const scoreColor = (s) => s >= 8 ? "#10b981" : s >= 5 ? "#f59e0b" : "#ef4444";

const Dashboard = ({ setAuth }) => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(null);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState(null);
  const [aiTip, setAiTip] = useState(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [loading, setLoading] = useState(true);
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
      } catch { }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchTip = async () => {
    setTipLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/prep/ai-tip`,
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/interview/${id}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setSelected(res.data);
    } catch { message.error("Failed to load"); }
  };

  if (loading) return (
    <div className="db-loading">
      <div className="db-loading-inner">
        <div className="db-spinner" />
        <p className="text-[14px]" style={{ color: "var(--text2)" }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const radarData = [
    { skill: "Accuracy",    value: Math.min(100, Math.round(((data?.averageScore || 0) / 50) * 100)) },
    { skill: "Consistency", value: Math.min(100, (data?.completed || 0) * 20) },
    { skill: "Breadth",     value: Math.min(100, Object.keys(data?.roleStats || {}).length * 25) },
    { skill: "Streak",      value: Math.min(100, (streak?.streak || 0) * 15) },
    { skill: "Growth",      value: Math.min(100, (data?.scoreTrend?.length || 0) > 1 ? 65 : 30) },
  ];
  const trendData = (data?.scoreTrend || []).map((s, i) => ({ n: `#${i + 1}`, score: s.score }));
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="page" style={{ background: "var(--bg)" }}>
      <div className="container pt-[88px] pb-[60px]">

        {/* HEADER ROW */}
        <div className="db-header-grid">
          <div>
            <p className="text-[13px] mb-1" style={{ color: "var(--muted2)" }}>Welcome back,</p>
            <h1
              className="font-extrabold mb-4 leading-none tracking-tight"
              style={{ fontSize: "clamp(22px,4vw,34px)", color: "var(--text)" }}
            >
              {user.name || "Candidate"} <span>👋</span>
            </h1>
            <div className="db-action-row">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/prep")}>📚 Prep Library</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/interview")}>+ New Interview</button>
            </div>
          </div>

          <div className="card card-p rounded-[18px]">
            {streak?.dailyChallenge && (
              <div
                className="db-challenge-row mb-[14px]"
                onClick={() =>
                  !streak.dailyChallenge.completed &&
                  navigate("/interview", { state: { role: "Software Developer", mode: "text" } })
                }
                style={{
                  cursor: streak.dailyChallenge.completed ? "default" : "pointer",
                  background: streak.dailyChallenge.completed ? "rgba(16,185,129,0.05)" : "rgba(99,102,241,0.05)",
                  border: `1px solid ${streak.dailyChallenge.completed ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"}`,
                }}
                onMouseOver={e => { if (!streak.dailyChallenge.completed) e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                onMouseOut={e =>  { if (!streak.dailyChallenge.completed) e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
              >
                <div className="db-challenge-inner">
                  <span className="text-[22px]">{streak.dailyChallenge.completed ? "✅" : "🎯"}</span>
                  <div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.05em] mb-[2px]"
                      style={{ color: streak.dailyChallenge.completed ? "#10b981" : "var(--indigo)" }}
                    >
                      Daily Challenge
                    </div>
                    <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{streak.dailyChallenge.title}</div>
                    <div className="text-[11px]" style={{ color: "var(--text2)" }}>{streak.dailyChallenge.description}</div>
                  </div>
                </div>
                <div className="db-challenge-badge-col">
                  <span
                    className={`text-[11px] whitespace-nowrap badge ${streak.dailyChallenge.completed ? "badge-green" : "badge-indigo"}`}
                  >
                    {streak.dailyChallenge.completed ? "✓ Done" : "Start →"}
                  </span>
                  {!streak.dailyChallenge.completed && (
                    <span className="text-[10px]" style={{ color: "var(--muted2)" }}>click to begin</span>
                  )}
                </div>
              </div>
            )}
            <div className="text-[12px] font-bold mb-[10px]" style={{ color: "var(--text)" }}>📅 Activity — Last Year</div>
            <CalendarHeatmap activity={activity} streak={streak?.streak || 0} />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="db-stat-grid">
          {[
            { label: "Interviews", val: data?.totalInterviews || 0, icon: "📝", grad: "var(--grad)" },
            { label: "Best Score", val: data?.bestScore || 0,        icon: "🏆", grad: "linear-gradient(135deg,#a855f7,#ec4899)" },
            { label: "Avg Score",  val: data?.averageScore || 0,     icon: "📊", grad: "var(--grad2)" },
            { label: "Day Streak", val: `${streak?.streak || 0}🔥`,  icon: "🔥", grad: "var(--grad-warm)" },
            { label: "Completed",  val: data?.completed || 0,        icon: "✅", grad: "var(--grad-green)" },
          ].map(s => (
            <div key={s.label} className="card db-stat-card">
              <div className="db-stat-icon">{s.icon}</div>
              <div className="db-stat-val">{s.val}</div>
              <div className="db-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div className="db-charts-grid">
          <div className="card card-p">
            <div className="text-[13px] font-bold mb-[10px]" style={{ color: "var(--text)" }}>🕸 Skill Radar</div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted2)", fontSize: 10, fontFamily: "Plus Jakarta Sans" }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card card-p">
            <div className="text-[13px] font-bold mb-[10px]" style={{ color: "var(--text)" }}>🎯 Performance</div>
            <div className="db-gauge-grid">
              <Gauge value={data?.averageScore || 0} max={50} label="Avg"  color="#6366f1" />
              <Gauge value={data?.bestScore || 0}    max={50} label="Best" color="#06b6d4" />
            </div>
          </div>

          <div className="card card-p">
            <div className="text-[13px] font-bold mb-[10px]" style={{ color: "var(--text)" }}>📈 Score Trend</div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trendData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="n" tick={{ fill: "var(--muted2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13 }} />
                  <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                    {trendData.map((_, i) => (
                      <Cell key={i} fill={i === trendData.length - 1 ? "#06b6d4" : "#6366f1"} opacity={i === trendData.length - 1 ? 1 : 0.65} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="db-no-data-center">Complete interviews to see trends</div>
            )}
          </div>
        </div>

        {/* AI TIPS + ROLES */}
        <div className="db-bottom-grid">
          <div className="card card-p">
            <div className="db-tips-header">
              <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>💡 AI Coaching</div>
              <button className="btn btn-ghost btn-sm" onClick={fetchTip} disabled={tipLoading}>
                {tipLoading ? "..." : "Get tips"}
              </button>
            </div>
            {aiTip ? (
              <div>
                <div
                  className="px-[14px] py-3 rounded-[10px] mb-[14px]"
                  style={{ background: "rgba(6,182,212,0.08)", borderLeft: "3px solid var(--cyan)" }}
                >
                  <p className="text-[13px] italic leading-[1.7] m-0" style={{ color: "var(--text2)" }}>"{aiTip.encouragement}"</p>
                </div>
                {(aiTip.tips || []).map((t, i) => (
                  <div key={i} className="db-tip-item">
                    <div className="db-tip-num">{i + 1}</div>
                    <p className="text-[13px] leading-[1.7] m-0" style={{ color: "var(--text2)" }}>{t}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-[22px] text-[13px]" style={{ color: "var(--muted2)" }}>
                Click "Get tips" for personalized AI coaching
              </div>
            )}
          </div>

          <div className="card card-p">
            <div className="text-[13px] font-bold mb-[14px]" style={{ color: "var(--text)" }}>🧩 Roles Practiced</div>
            {Object.keys(data?.roleStats || {}).length === 0 ? (
              <div className="text-center py-5 text-[13px]" style={{ color: "var(--muted2)" }}>
                Practice different roles to see breakdown
              </div>
            ) : (
              Object.entries(data.roleStats).map(([role, count]) => (
                <div key={role} className="db-roles-item">
                  <div className="db-roles-row">
                    <span className="text-[13px]" style={{ color: "var(--text2)" }}>{role}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--indigo)" }}>{count}×</span>
                  </div>
                  <div className="prog-track h-[6px]">
                    <div className="prog-fill" style={{ width: `${Math.min(100, count * 34)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HISTORY */}
        <div className="card card-p">
          <div className="text-[13px] font-bold mb-[14px]" style={{ color: "var(--text)" }}>📋 Interview History</div>
          {history.length === 0 ? (
            <div className="text-center p-[44px]">
              <div className="text-[44px] mb-3">🎯</div>
              <div className="text-[16px] font-bold mb-2" style={{ color: "var(--text)" }}>No interviews yet</div>
              <p className="text-[14px] mb-5" style={{ color: "var(--text2)" }}>Start your first AI interview to see results here</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/interview")}>Start your first interview →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map(item => (
                <div key={item._id} className="db-history-item" onClick={() => fetchDetail(item._id)}>
                  <div>
                    <div className="text-[14px] font-bold mb-[5px]" style={{ color: "var(--text)" }}>{item.role}</div>
                    <div className="db-history-badges">
                      <span className="badge badge-indigo text-[10px]">{item.level}</span>
                      <span
                        className="badge text-[10px]"
                        style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted2)" }}
                      >
                        {item.difficulty || "medium"}
                      </span>
                      <span className="text-[12px]" style={{ color: "var(--muted2)" }}>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="db-history-score">
                      {item.overallScore}
                      <span className="text-[12px] font-normal" style={{ WebkitTextFillColor: "var(--muted2)" }}>/50</span>
                    </div>
                    <span className={`badge text-[10px] ${item.status === "completed" ? "badge-green" : "badge-indigo"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={820}
        title={<span>{selected?.role} — Results</span>}
      >
        {selected && (
          <div>
            <div className="db-modal-header">
              <span className="badge badge-indigo">{selected.level}</span>
              <span className="badge" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--muted2)" }}>
                {selected.difficulty}
              </span>
              <span className="text-[13px]" style={{ color: "var(--muted2)" }}>{new Date(selected.createdAt).toLocaleString()}</span>
              <span className="db-modal-score ml-auto">{selected.overallScore} / {selected.questions?.length * 10}</span>
            </div>

            <div className="prog-track h-[8px] mb-[18px]">
              <div className="prog-fill" style={{ width: `${Math.round((selected.overallScore / (selected.questions?.length * 10)) * 100)}%` }} />
            </div>

            {selected.deepDiveFeedback?.summary && (
              <div
                className="px-4 py-3 rounded-[10px] mb-4"
                style={{ background: "rgba(99,102,241,0.07)", borderLeft: "3px solid var(--indigo)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.05em] mb-[5px]" style={{ color: "var(--indigo)" }}>AI Summary</div>
                <p className="text-[13px] leading-[1.7] m-0" style={{ color: "var(--text2)" }}>{selected.deepDiveFeedback.summary}</p>
              </div>
            )}

            {selected.questions?.map((q, i) => (
              <div
                key={i}
                className="mb-[10px] px-4 py-[14px] rounded-[11px] border"
                style={{ borderColor: `${scoreColor(q.score)}40` }}
              >
                <div className="db-modal-q-header">
                  <span className="text-[13px] font-semibold flex-1 mr-3" style={{ color: "var(--text)" }}>Q{i + 1}. {q.question}</span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[11px] flex-shrink-0"
                    style={{
                      background: `${scoreColor(q.score)}18`,
                      border: `2px solid ${scoreColor(q.score)}`,
                      color: scoreColor(q.score),
                    }}
                  >
                    {q.score}/10
                  </div>
                </div>
                <div className="text-[12px] mb-[6px]" style={{ color: "var(--text2)" }}><strong>Answer:</strong> {q.userAnswer || "—"}</div>
                <div
                  className="text-[12px] pl-[10px] leading-[1.6]"
                  style={{ color: "var(--text2)", borderLeft: `2.5px solid ${scoreColor(q.score)}` }}
                >
                  {q.feedback}
                </div>
              </div>
            ))}

            <button className="btn btn-ghost btn-sm mt-[6px]" onClick={() => setSelected(null)}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
