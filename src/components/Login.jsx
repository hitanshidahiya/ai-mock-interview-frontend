import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const Login = ({ setAuth }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        form,
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuth(true);
      navigate("/dashboard");
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="auth-split-page">
      {/* Left panel */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          {/* <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">⚡</div>
            <span className="auth-brand-name">MockAI</span>
          </Link> */}
          <div className="auth-left-tagline">
            <h2 className="auth-left-heading">
              Ace every<br />
              <span className="g-text">interview.</span>
            </h2>
            <p className="auth-left-sub">
              AI-powered mock interviews with real-time feedback. Practice smarter, land faster.
            </p>
          </div>
          <div className="auth-left-features">
            {["Real AI feedback on every answer", "Track your progress over time", "500+ role-specific questions"].map((f) => (
              <div key={f} className="auth-feature-row">
                <div className="auth-feature-check">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="auth-left-stat-row">
            <div className="auth-left-stat"><span className="auth-left-stat-val">10k+</span><span className="auth-left-stat-lbl">Interviews done</span></div>
            <div className="auth-left-stat-divider" />
            <div className="auth-left-stat"><span className="auth-left-stat-val">94%</span><span className="auth-left-stat-lbl">Satisfaction rate</span></div>
            <div className="auth-left-stat-divider" />
            <div className="auth-left-stat"><span className="auth-left-stat-val">Free</span><span className="auth-left-stat-lbl">Forever</span></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right-panel">
        <div className="auth-right-inner">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to continue your practice</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-v2">
            <div className="auth-field-group">
              <label className="auth-field-label">Email address</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon">✉</span>
                <input
                  className="auth-field-v2"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label">Password</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon">🔒</span>
                <input
                  className="auth-field-v2"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                />
                <button
                  type="button"
                  className="auth-field-eye"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button className="auth-submit-v2" type="submit" disabled={loading}>
              {loading ? (
                <><span className="spin-indicator" /> Signing in…</>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          <div className="auth-divider-v2">
            <span>or</span>
          </div>

          <p className="auth-switch-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
