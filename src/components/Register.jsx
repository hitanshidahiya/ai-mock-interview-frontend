import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const Register = ({ setAuth }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/auth/register`;
      console.log("REGISTER URL:", url);
      const res = await axios.post(url, form, { withCredentials: true });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuth(true); navigate("/dashboard");
    } catch (err) { message.error(err.response?.data?.message || "Registration failed"); }
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>Create your account</h1>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 32 }}>Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="auth-form auth-form-gap-sm">
            <div>
              <label className="field-label">Full name</label>
              <input className="field" type="text" placeholder="John Doe" value={form.name} onChange={set("name")} required />
            </div>
            <div>
              <label className="field-label">Email address</label>
              <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="field" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
              {loading
                ? <><span className="spin-indicator" /> Creating account...</>
                : "Get started free →"}
            </button>
          </form>

          <div className="divider auth-divider" />
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text2)" }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

