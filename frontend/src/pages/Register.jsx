import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, Phone, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('student'); // 'student' or 'college_admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
      };

      if (role === 'college_admin') {
        if (!collegeCode) {
          throw new Error('Please enter your college code (e.g. VGNT, CBIT, JNTH)');
        }
        payload.collegeCode = collegeCode;
      }

      const user = await register(payload);
      if (user.role === 'college_admin') {
        navigate('/college-admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrap register-card-wrap">
        <div className="auth-card-header">
          <Link to="/" className="auth-logo-row">
            <div className="auth-logo-box">
              <GraduationCap size={24} />
            </div>
            <span className="auth-brand-name">
              COLLEGE<span className="brand-blue">FINDER</span>
            </span>
          </Link>
          <h2 className="auth-title">Create Free Account</h2>
          <p className="auth-subtitle">
            Join Telangana's premier B.Tech college discovery & admissions platform.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'student' ? 'role-tab-active' : ''}`}
            onClick={() => setRole('student')}
          >
            <User size={16} />
            <span>Student / Parent</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'college_admin' ? 'role-tab-active' : ''}`}
            onClick={() => setRole('college_admin')}
          >
            <Building2 size={16} />
            <span>College Admin</span>
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="auth-input-wrap">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="auth-input-field"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
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
              <label className="form-label">Mobile Number *</label>
              <div className="auth-input-wrap">
                <Phone size={18} className="auth-input-icon" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="auth-input-field"
                />
              </div>
            </div>
          </div>

          {role === 'college_admin' && (
            <div className="form-group">
              <label className="form-label">College Code (e.g. VGNT, CBIT, JNTH) *</label>
              <div className="auth-input-wrap">
                <Building2 size={18} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                  placeholder="VGNT"
                  className="auth-input-field uppercase-input"
                />
              </div>
              <span className="field-hint-text">
                Matches your college code in the Telangana B.Tech dataset to automatically link your admin workspace.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password * (min 6 characters)</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="auth-input-field"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            <span>{loading ? 'Creating Account...' : 'Register Now'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

