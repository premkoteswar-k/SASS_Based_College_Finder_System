import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  GitCompare,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { wishlistApi } from '../utils/api';
import Badge from './Badge';
import './CollegeCard.css';

const CollegeCard = ({
  college,
  isWishlistedInitially = false,
  onEnquireClick,
  onCompareToggle,
  isCompared = false,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(isWishlistedInitially);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoadingWishlist(true);
      if (wishlisted) {
        await wishlistApi.remove(college._id);
        setWishlisted(false);
      } else {
        await wishlistApi.add(college._id);
        setWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCompareToggle) {
      onCompareToggle(college);
    }
  };

  return (
    <div className={`college-card ${college.featured ? 'featured-border' : ''}`}>
      {/* Top Banner & Badges */}
      <div className="college-card-media">
        <img
          src={college.bannerImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80'}
          alt={college.name}
          className="college-card-img"
        />
        <div className="media-overlay"></div>

        <div className="card-top-badges">
          <span className="college-code-tag">{college.code}</span>
          {college.isVerified && (
            <Badge type="success" size="sm" icon={ShieldCheck} label="Verified" />
          )}
          {college.featured && (
            <Badge type="purple" size="sm" label="Featured Partner" />
          )}
        </div>

        <button
          className={`wishlist-floating-btn ${wishlisted ? 'active-wishlist' : ''}`}
          onClick={handleWishlistToggle}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          disabled={loadingWishlist}
        >
          <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* College Info Body */}
      <div className="college-card-body">
        <div className="college-rating-row">
          <div className="stars-box">
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span className="rating-score">{college.rating ? college.rating.toFixed(1) : '4.2'}</span>
            <span className="reviews-num">({college.reviewsCount || 12} reviews)</span>
          </div>
          <span className="college-type-pill">{college.type || 'Affiliated'}</span>
        </div>

        <h3 className="college-card-title">
          <Link to={`/colleges/${college.slug || college._id}`}>
            {college.name}
          </Link>
        </h3>

        <div className="college-meta-row">
          <MapPin size={15} className="meta-icon" />
          <span className="meta-text">{college.district}, {college.state}</span>
        </div>

        <p className="college-affiliation-text">
          {college.affiliation}
        </p>

        {/* Accreditations */}
        {college.accreditation && college.accreditation.length > 0 && (
          <div className="accreditation-pills">
            {college.accreditation.slice(0, 3).map((acc, idx) => (
              <span key={idx} className="acc-tag">{acc}</span>
            ))}
          </div>
        )}

        {/* Highlight Placement Stats */}
        {college.placementStats?.highestPackage > 0 && (
          <div className="placement-metric-strip">
            <div className="metric-box">
              <span className="metric-label">Highest Package</span>
              <span className="metric-value">₹{college.placementStats.highestPackage} LPA</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-box">
              <span className="metric-label">Avg Package</span>
              <span className="metric-value">₹{college.placementStats.averagePackage || 5.0} LPA</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="college-card-footer">
        <button
          className={`compare-toggle-btn ${isCompared ? 'btn-compared' : ''}`}
          onClick={handleCompareClick}
          title="Compare with other colleges"
        >
          <GitCompare size={15} />
          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
        </button>

        <div className="footer-right-actions">
          {onEnquireClick && (
            <button
              className="btn-card-enquire"
              onClick={() => onEnquireClick(college)}
            >
              Enquire
            </button>
          )}
          <Link
            to={`/colleges/${college.slug || college._id}`}
            className="btn-card-details"
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;

