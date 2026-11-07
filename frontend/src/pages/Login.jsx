import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'college_admin') {
        navigate('/college-admin/dashboard');
      } else {
        const from = location.state?.from?.pathname || '/student/dashboard';
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for the user to instantly test all 3 roles
  const handleQuickFill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrap">
        <div className="auth-card-header">
          <Link to="/" className="auth-logo-row">
            <div className="auth-logo-box">
              <GraduationCap size={24} />
            </div>
            <span className="auth-brand-name">
              COLLEGE<span className="brand-blue">FINDER</span>
            </span>
          </Link>
          <h2 className="auth-title">Sign In to Your Account</h2>
          <p className="auth-subtitle">
            Enter your credentials to access your personalized portal.
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="quick-access-box">
          <p className="quick-access-label">Quick Test Logins (1-Click Fill):</p>
          <div className="quick-buttons-row">
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => handleQuickFill('admin@collegefinder.com', 'Admin@123')}
            >
              <ShieldCheck size={14} />
              <span>Super Admin</span>
            </button>
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => handleQuickFill('vgnt.admin@collegefinder.com', 'College@123')}
            >
              <Building2 size={14} />
              <span>College Admin (VGNT)</span>
            </button>
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => handleQuickFill('student@collegefinder.com', 'Student@123')}
            >
              <User size={14} />
              <span>Student</span>
            </button>
          </div>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="auth-input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input-field"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-switch-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

