import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const Login = ({ setAuth }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form, { withCredentials: true });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuth(true); navigate("/dashboard");
    } catch (err) { message.error(err.response?.data?.message || "Login failed"); }
    setLoading(false);
  };

  return (
    <div className="page mesh-bg dot-grid" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="card" style={{ padding: 44, borderRadius: 28, boxShadow: "var(--shadow-lg)" }}>
          <Link to="/" className="logo-wrap" style={{ marginBottom: 32, display: "flex" }}>
            <div className="logo-icon">⚡</div>
            <span className="logo-name">MockAI</span>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 32 }}>Sign in to continue your interview practice.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="field-label">Email address</label>
              <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="field" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", height: 48, fontSize: 15, borderRadius: 12, marginTop: 4 }}>
              {loading
                ? <><span style={{ width: 15, height: 15, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Signing in...</>
                : "Sign in"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }} />
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "var(--indigo)", fontWeight: 600, textDecoration: "none" }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
