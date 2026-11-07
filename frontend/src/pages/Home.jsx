import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  Building2,
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { collegeApi, subscriptionApi } from '../utils/api';
import CollegeCard from '../components/CollegeCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredColleges, setFeaturedColleges] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [collegesRes, districtsRes, plansRes] = await Promise.all([
          collegeApi.getAll({ limit: 6, sortBy: 'rating', sortOrder: 'desc' }),
          collegeApi.getDistricts(),
          subscriptionApi.getPlans(),
        ]);

        setFeaturedColleges(collegesRes.data || []);
        setDistricts(districtsRes.data || []);
        setPlans(plansRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedDistrict) params.append('district', selectedDistrict);
    navigate(`/colleges?${params.toString()}`);
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tag-pill">
            <Sparkles size={14} className="tag-sparkle-icon" />
            <span>Telangana B.Tech Discovery & Direct Admissions SaaS</span>
          </div>

          <h1 className="hero-title">
            Discover Your Dream Engineering College in <span className="highlight-text">Telangana</span>
          </h1>

          <p className="hero-subtitle">
            Explore authentic B.Tech fee structures, NAAC & NBA accreditations, verified placement statistics, and connect directly with admission offices like Vignan (VGNT), CBIT, and JNTUH.
          </p>

          {/* Quick Search Widget */}
          <form className="hero-search-bar" onSubmit={handleHeroSearch}>
            <div className="search-field-group">
              <Search className="field-icon" size={20} />
              <input
                type="text"
                placeholder="Search by college name or code (e.g. VGNT, CBIT, JNTU)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-field"
              />
            </div>

            <div className="search-divider"></div>

            <div className="search-field-group select-group">
              <MapPin className="field-icon" size={20} />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="search-select-field"
              >
                <option value="">All Telangana Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="hero-search-btn">
              <span>Find Colleges</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Stats Banner */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">250+</span>
              <span className="stat-label">B.Tech Colleges</span>
            </div>
            <div className="stat-sep"></div>
            <div className="hero-stat-item">
              <span className="stat-number">1,200+</span>
              <span className="stat-label">Engineering Courses</span>
            </div>
            <div className="stat-sep"></div>
            <div className="hero-stat-item">
              <span className="stat-number">₹50 LPA</span>
              <span className="stat-label">Top Package Recorded</span>
            </div>
            <div className="stat-sep"></div>
            <div className="hero-stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Verified Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Colleges Section */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header-row">
            <div>
              <span className="section-kicker">Top Tier Institutions</span>
              <h2 className="section-heading">Featured Telangana B.Tech Colleges</h2>
              <p className="section-subtext">
                Recognized for academic excellence, NAAC A+ accreditations, and stellar campus placements.
              </p>
            </div>
            <Link to="/colleges" className="view-all-link">
              <span>Browse All Colleges</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-grid-placeholder">
              <div className="placeholder-card shimmer"></div>
              <div className="placeholder-card shimmer"></div>
              <div className="placeholder-card shimmer"></div>
            </div>
          ) : (
            <div className="colleges-cards-grid">
              {featuredColleges.map((college) => (
                <CollegeCard key={college._id} college={college} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose CollegeFinder SaaS */}
      <section className="features-value-section">
        <div className="section-container">
          <div className="centered-section-header">
            <span className="section-kicker">Transparent & Direct</span>
            <h2 className="section-heading">Why Students & Colleges Trust COLLEGEFINDER</h2>
            <p className="section-subtext">
              Built on rigorous verified data from Telangana state universities and authentic institution administration.
            </p>
          </div>

          <div className="value-props-grid">
            <div className="value-prop-card">
              <div className="value-icon-box bg-blue">
                <ShieldCheck size={28} />
              </div>
              <h3 className="value-card-title">Authentic Verification</h3>
              <p className="value-card-desc">
                No invented fees or fabricated placements. Every college profile and course list is verified against JNTUH and State Council records.
              </p>
            </div>

            <div className="value-prop-card">
              <div className="value-icon-box bg-green">
                <Building2 size={28} />
              </div>
              <h3 className="value-card-title">Independent College Dashboards</h3>
              <p className="value-card-desc">
                College authorities manage their real-time seat matrix, fee structures, and interact with prospective engineering candidates directly.
              </p>
            </div>

            <div className="value-prop-card">
              <div className="value-icon-box bg-amber">
                <TrendingUp size={28} />
              </div>
              <h3 className="value-card-title">Side-by-Side Comparison</h3>
              <p className="value-card-desc">
                Compare up to 3 colleges simultaneously across affiliations, accreditations, average packages, and available engineering specializations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Plans & Pricing Section */}
      <section id="plans-section" className="pricing-section">
        <div className="section-container">
          <div className="centered-section-header">
            <span className="section-kicker">For Educational Institutions</span>
            <h2 className="section-heading">SaaS Subscription Plans for Colleges</h2>
            <p className="section-subtext">
              Scale your college admissions and reach thousands of TS EAMCET students with premier listing tools.
            </p>
          </div>

          <div className="pricing-cards-grid">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`pricing-card ${plan.code === 'growth_pro' ? 'pricing-popular' : ''}`}
              >
                {plan.code === 'growth_pro' && (
                  <span className="popular-badge">Most Popular</span>
                )}
                <div className="pricing-card-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                  <div className="plan-price-wrap">
                    <span className="currency-sign">₹</span>
                    <span className="plan-amount">{plan.price.toLocaleString('en-IN')}</span>
                    <span className="plan-period">/ year</span>
                  </div>
                </div>

                <div className="plan-features-divider"></div>

                <ul className="plan-features-list">
                  {plan.features?.map((feat, idx) => (
                    <li key={idx} className="plan-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`plan-cta-btn ${
                    plan.code === 'growth_pro' ? 'cta-primary' : 'cta-outline'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free Today' : `Choose ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-section">
        <div className="section-container cta-banner-inner">
          <div className="cta-banner-text">
            <h2>Are You a Telangana Engineering College Administrator?</h2>
            <p>
              Claim your college profile today, publish cutoffs, and manage verified admission enquiries in your dedicated portal.
            </p>
          </div>
          <div className="cta-banner-actions">
            <Link to="/register" className="btn-cta-white">
              Claim Your College
            </Link>
            <Link to="/colleges" className="btn-cta-ghost">
              Explore Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

