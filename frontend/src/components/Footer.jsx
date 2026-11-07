import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <div className="footer-logo-box">
              <GraduationCap size={22} />
            </div>
            <span className="footer-logo-title">
              COLLEGE<span className="footer-accent">FINDER</span>
            </span>
          </div>
          <p className="footer-tagline">
            Empowering students and parents across Telangana with verified B.Tech colleges, authentic fee structures, transparent placement data, and seamless direct admissions.
          </p>
          <div className="footer-contact-item">
            <MapPin size={16} />
            <span>Hyderabad & Telangana State, India</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={16} />
            <span>support@collegefinder.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Platform Discovery</h4>
          <ul className="footer-list">
            <li><Link to="/colleges">Explore All Colleges</Link></li>
            <li><Link to="/compare">Side-by-Side Comparison</Link></li>
            <li><Link to="/colleges?district=Hyderabad">Colleges in Hyderabad</Link></li>
            <li><Link to="/colleges?district=Yadadri%20Bhuvanagiri">Yadadri Bhuvanagiri Institutes</Link></li>
            <li><Link to="/colleges?district=Rangareddy">Rangareddy Engineering Hub</Link></li>
          </ul>
        </div>

        {/* Institutions & Admins */}
        <div className="footer-col">
          <h4 className="footer-heading">For Institutions</h4>
          <ul className="footer-list">
            <li><Link to="/register">Register College Profile</Link></li>
            <li><Link to="/login">College Admin Portal</Link></li>
            <li><a href="#plans-section">SaaS Growth Plans</a></li>
            <li><Link to="/login">Super Admin Governance</Link></li>
          </ul>
        </div>

        {/* Featured Institution Spotlight */}
        <div className="footer-col spotlight-col">
          <h4 className="footer-heading">Institution Spotlight</h4>
          <div className="spotlight-card">
            <p className="spotlight-name">Vignan Institute of Tech & Sciences</p>
            <p className="spotlight-desc">Affiliated to JNTUH, NAAC A+, Deshmukhi, Telangana.</p>
            <Link to="/colleges/vignan-institute-of-technology-and-science" className="spotlight-link">
              <span>View Profile & Cutoffs</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} COLLEGEFINDER SaaS Platform. All Rights Reserved. Built with MERN Stack.
          </p>
          <div className="footer-legal-links">
            <a href="#terms">Terms of Service</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#security">Security & Isolation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

