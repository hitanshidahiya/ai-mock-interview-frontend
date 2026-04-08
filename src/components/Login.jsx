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
    <div className="page mesh-bg dot-grid auth-page">
      <div className="auth-wrapper">
        <div className="card auth-card">
          <Link to="/" className="logo-wrap auth-logo-wrap">
            <div className="logo-icon">⚡</div>
            <span className="logo-name">MockAI</span>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 32 }}>Sign in to continue your interview practice.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="field-label">Email address</label>
              <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="field" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="spin-indicator" /> Signing in...</>
                : "Sign in"}
            </button>
          </form>

          <div className="divider auth-divider" />
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)" }}>
            No account?{" "}
            <Link to="/register" className="auth-link">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
