import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ setAuth, auth }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to={auth ? "/dashboard" : "/"} className="logo-wrap">
          <div className="logo-icon">⚡</div>
          <span className="logo-name">MockAI</span>
        </Link>

        <div className="nav-links">
          {auth ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>Dashboard</Link>
              <Link to="/interview" className={`nav-link ${isActive("/interview") ? "active" : ""}`}>Interview</Link>
              <Link to="/prep"      className={`nav-link ${isActive("/prep")      ? "active" : ""}`}>Prep Library</Link>
            </>
          ) : (
            <>
              <Link to="/"      className={`nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
              <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>Sign in</Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {/* Clearly visible toggle pill */}
          <div className="theme-toggle" onClick={toggleDarkMode} role="button" aria-label="Toggle theme">
            <span className="toggle-emoji">{isDarkMode ? "🌙" : "☀️"}</span>
            <div className={`toggle-track ${isDarkMode ? "on" : ""}`}>
              <div className="toggle-thumb" />
            </div>
          </div>

          {auth
            ? <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
            : <button className="btn btn-primary btn-sm" onClick={() => navigate("/register")}>Get started</button>
          }
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
