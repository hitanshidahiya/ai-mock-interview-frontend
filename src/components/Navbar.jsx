import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ setAuth, auth }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks = auth ? (
    <>
      <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
      <Link to="/interview" className={`nav-link ${isActive("/interview") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Interview</Link>
      <Link to="/prep"      className={`nav-link ${isActive("/prep")      ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Prep Library</Link>
    </>
  ) : (
    <>
      <Link to="/"      className={`nav-link ${isActive("/") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Home</Link>
      <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>Sign in</Link>
    </>
  );

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to={auth ? "/dashboard" : "/"} className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <span className="logo-name">MockAI</span>
          </Link>

          <div className="nav-links">{navLinks}</div>

          <div className="nav-right">
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

            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks}
        <div className="divider" />
        {auth
          ? <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { navigate("/register"); setMenuOpen(false); }}>Get started</button>
        }
      </div>
    </>
  );
};

export default Navbar;
