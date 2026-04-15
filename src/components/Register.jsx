import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const Register = ({ setAuth }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      message.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        form,
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuth(true);
      navigate("/dashboard");
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"][strength];

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
              Start your<br />
              <span className="g-text">journey today.</span>
            </h2>
            <p className="auth-left-sub">
              Join MockAI today and transform the way you prepare—smarter, faster, and closer to your dream role.
            </p>
          </div>
          <div className="auth-left-features">
            {[
              "Free forever — no credit card needed",
              "AI feedback tailored to your role",
              "Interview history & progress tracking",
            ].map((f) => (
              <div key={f} className="auth-feature-row">
                <div className="auth-feature-check">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="auth-left-stat-row">
            <div className="auth-left-stat"><span className="auth-left-stat-val">2 min</span><span className="auth-left-stat-lbl">To get started</span></div>
            <div className="auth-left-stat-divider" />
            <div className="auth-left-stat"><span className="auth-left-stat-val">50+</span><span className="auth-left-stat-lbl">Job roles</span></div>
            <div className="auth-left-stat-divider" />
            <div className="auth-left-stat"><span className="auth-left-stat-val">100%</span><span className="auth-left-stat-lbl">AI-powered</span></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right-panel">
        <div className="auth-right-inner">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-v2">
            <div className="auth-field-group">
              <label className="auth-field-label">Full name</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon">👤</span>
                <input
                  className="auth-field-v2"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
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
              {form.password.length > 0 && (
                <div className="auth-pass-strength">
                  <div className="auth-pass-bars">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="auth-pass-bar"
                        style={{ background: i <= strength ? strengthColor : "var(--border2)" }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <button className="auth-submit-v2" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <><span className="spin-indicator" /> Creating account…</>
              ) : (
                "Get started free →"
              )}
            </button>
          </form>

          <div className="auth-divider-v2">
            <span>or</span>
          </div>

          <p className="auth-switch-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
