import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { UserContext } from "./Hooks/UseContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="header-nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <span className="brand-icon">🌾</span>
          AICI
        </Link>

        <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
          <div className="nav-main-links">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/predict" className="nav-link" onClick={closeMobileMenu}>Predictions</Link>
            <Link to="/pest" className="nav-link" onClick={closeMobileMenu}>Pest Analysis</Link>
            <Link to="/disease" className="nav-link" onClick={closeMobileMenu}>Disease Detection</Link>
            <Link to="/crophea" className="nav-link" onClick={closeMobileMenu}>Crop Nutrient</Link>
            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <>
                <span className="username">Welcome, {user.username}</span>
                <button onClick={handleLogout} className="btn btn-primary">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>
                Login
              </Link>
            )}

          </div>
        </div>

        <button
          className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
