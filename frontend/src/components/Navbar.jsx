import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Heart,
  GitCompare,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'super_admin') return '/super-admin/dashboard';
    if (user.role === 'college_admin') return '/college-admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon-box">
            <GraduationCap className="logo-icon" size={24} />
          </div>
          <span className="logo-text">
            COLLEGE<span className="logo-accent">FINDER</span>
          </span>
          <span className="saas-pill">SaaS</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          <Link to="/colleges" className="nav-link">
            Explore Colleges
          </Link>
          <Link to="/compare" className="nav-link">
            <GitCompare size={16} />
            <span>Compare</span>
          </Link>
          <a href="#plans-section" className="nav-link">
            Plans & Pricing
          </a>
        </nav>

        {/* Actions / Auth */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <Link to="/student/wishlist" className="action-icon-btn" title="Saved Colleges">
                <Heart size={20} />
              </Link>

              <button
                className="user-pill-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar-circle">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">{user.name.split(' ')[0]}</span>
                  <span className="user-pill-role">
                    {user.role === 'super_admin'
                      ? 'Super Admin'
                      : user.role === 'college_admin'
                      ? 'College Admin'
                      : 'Student'}
                  </span>
                </div>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to={getDashboardLink()}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  {user.role === 'college_admin' && (
                    <Link
                      to="/college-admin/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Building2 size={16} />
                      <span>College Profile</span>
                    </Link>
                  )}
                  {user.role === 'super_admin' && (
                    <Link
                      to="/super-admin/colleges"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      <span>Manage Colleges</span>
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Log In
              </Link>
              <Link to="/register" className="btn-register">
                Register Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          <Link
            to="/colleges"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore Colleges
          </Link>
          <Link
            to="/compare"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Compare Colleges
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="mobile-nav-link logout-link"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-group">
              <Link
                to="/login"
                className="btn-login mobile-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-register mobile-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

