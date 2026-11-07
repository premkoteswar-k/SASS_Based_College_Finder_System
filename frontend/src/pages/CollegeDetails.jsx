import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Award,
  ShieldCheck,
  Star,
  CheckCircle,
  Heart,
  TrendingUp,
  Share2,
  BookOpen,
  MessageSquare,
  Building,
  Sparkles,
} from 'lucide-react';
import { collegeApi, enquiryApi, reviewApi, wishlistApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import './CollegeDetails.css';

const CollegeDetails = () => {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses'); // 'overview', 'courses', 'placements', 'reviews'
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Enquiry form
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    eamcetRank: '',
    courseId: '',
    message: 'Hello, I would like to enquire regarding admission criteria and seat vacancy for B.Tech.',
  });
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        const res = await collegeApi.getOne(idOrSlug);
        setCollege(res.data);

        // Pre-fill enquiry name/email if user logged in
        if (user) {
          setEnquiryForm((prev) => ({
            ...prev,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
          }));

          // Check wishlist
          try {
            const wishRes = await wishlistApi.check(res.data._id);
            setIsWishlisted(wishRes.isWishlisted);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to load college:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [idOrSlug, user]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark colleges to your wishlist.');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.remove(college._id);
        setIsWishlisted(false);
      } else {
        await wishlistApi.add(college._id);
        setIsWishlisted(true);
      }
    } catch (err) {
      alert(err.message || 'Error updating wishlist');
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      setEnquiryLoading(true);
      await enquiryApi.create({
        collegeId: college._id,
        courseId: enquiryForm.courseId || null,
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        eamcetRank: enquiryForm.eamcetRank,
        message: enquiryForm.message,
      });
      setEnquirySuccess(true);
    } catch (err) {
      alert(err.message || 'Error submitting enquiry');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setReviewSubmitting(true);
      await reviewApi.create({
        collegeId: college._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviewMessage('Your review has been published successfully!');
      // Reload college data to update reviews list & rating
      const updatedRes = await collegeApi.getOne(idOrSlug);
      setCollege(updatedRes.data);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      setReviewMessage(`Error: ${err.message}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="details-loading-screen">
        <div className="spinner-circle"></div>
        <p>Loading institution profile and fee structures...</p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="details-not-found">
        <h2>Institution Not Found</h2>
        <p>The college record you are looking for does not exist or has been archived.</p>
        <Link to="/colleges" className="btn-back-colleges">
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="college-details-page">
      {/* College Banner Header */}
      <div className="details-hero-banner">
        <img
          src={college.bannerImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80'}
          alt={college.name}
          className="details-hero-bg"
        />
        <div className="details-hero-overlay"></div>

        <div className="details-hero-content">
          <div className="details-badge-row">
            <span className="details-code-pill">{college.code}</span>
            {college.isVerified && (
              <Badge type="success" size="md" icon={ShieldCheck} label="Verified Institute" />
            )}
            {college.featured && (
              <Badge type="purple" size="md" icon={Sparkles} label="Featured Partner" />
            )}
            <span className="details-type-tag">{college.type}</span>
          </div>

          <h1 className="details-college-name">{college.name}</h1>
          <p className="details-college-tagline">{college.tagline || college.affiliation}</p>

          <div className="details-meta-strip">
            <div className="details-meta-item">
              <MapPin size={16} />
              <span>{college.district}, Telangana</span>
            </div>
            <div className="details-meta-item">
              <Calendar size={16} />
              <span>Estd. {college.establishmentYear || '1999'}</span>
            </div>
            <div className="details-meta-item">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{college.rating ? college.rating.toFixed(1) : '4.5'} ({college.reviewsCount || 0} Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Wrap */}
      <div className="details-layout-wrap">
        {/* Left Column: Navigation Tabs & Tab Content */}
        <div className="details-main-column">
          {/* Tabs Bar */}
          <div className="details-tabs-bar">
            <button
              className={`details-tab-btn ${activeTab === 'courses' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={18} />
              <span>Courses & Fees ({college.courses?.length || 0})</span>
            </button>
            <button
              className={`details-tab-btn ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Building size={18} />
              <span>Overview & Facilities</span>
            </button>
            <button
              className={`details-tab-btn ${activeTab === 'placements' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('placements')}
            >
              <TrendingUp size={18} />
              <span>Placements</span>
            </button>
            <button
              className={`details-tab-btn ${activeTab === 'reviews' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              <span>Reviews ({college.reviews?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: COURSES & FEES */}
          {activeTab === 'courses' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h3 className="pane-title">Available B.Tech Courses & Annual Fees</h3>
                <p className="pane-sub">
                  Official fee structures approved by Telangana State Council of Higher Education (TSCHE).
                </p>
              </div>

              {college.courses?.length === 0 ? (
                <p className="no-data-notice">No courses listed yet for this college.</p>
              ) : (
                <div className="courses-table-wrap">
                  <table className="courses-table">
                    <thead>
                      <tr>
                        <th>Degree & Branch</th>
                        <th>Duration</th>
                        <th>Intake</th>
                        <th>Annual Tuition</th>
                        <th>Eligibility & Exam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {college.courses?.map((course) => (
                        <tr key={course._id}>
                          <td>
                            <div className="course-name-cell">
                              <span className="course-degree-badge">{course.degree}</span>
                              <span className="course-name-text">{course.name}</span>
                              {course.specialization && (
                                <span className="course-spec-text">({course.specialization})</span>
                              )}
                            </div>
                          </td>
                          <td>{course.duration || '4 Years'}</td>
                          <td><strong>{course.intake}</strong> Seats</td>
                          <td>
                            <span className="fee-highlight">
                              ₹{course.feePerYear?.toLocaleString('en-IN')} / yr
                            </span>
                          </td>
                          <td>
                            <div className="eligibility-cell">
                              <span>{course.examAccepted || 'TS EAMCET'}</span>
                              <span className="sub-eligibility">{course.eligibility}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW & FACILITIES */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h3 className="pane-title">About {college.name}</h3>
              </div>
              <p className="about-text-content">
                {college.about ||
                  `${college.name} is a premier engineering institution affiliated with ${college.affiliation}. Offering advanced technical learning and industry-oriented curricula.`}
              </p>

              <div className="facilities-section-block">
                <h4 className="sub-block-title">Campus Facilities & Infrastructure</h4>
                <div className="facilities-tags-grid">
                  {college.facilities?.map((f, idx) => (
                    <div key={idx} className="facility-pill">
                      <CheckCircle size={15} className="facility-check-icon" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-details-block">
                <h4 className="sub-block-title">Campus Location & Contact</h4>
                <div className="contact-info-grid">
                  <div className="contact-info-card">
                    <MapPin size={20} className="info-card-icon" />
                    <div>
                      <p className="info-card-label">Campus Address</p>
                      <p className="info-card-val">{college.address || college.city || 'Hyderabad, Telangana'}</p>
                    </div>
                  </div>
                  {college.website && (
                    <div className="contact-info-card">
                      <Globe size={20} className="info-card-icon" />
                      <div>
                        <p className="info-card-label">Official Website</p>
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noreferrer"
                          className="info-card-link"
                        >
                          {college.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {college.contactEmail && (
                    <div className="contact-info-card">
                      <Mail size={20} className="info-card-icon" />
                      <div>
                        <p className="info-card-label">Admissions Email</p>
                        <p className="info-card-val">{college.contactEmail}</p>
                      </div>
                    </div>
                  )}
                  {college.contactPhone && (
                    <div className="contact-info-card">
                      <Phone size={20} className="info-card-icon" />
                      <div>
                        <p className="info-card-label">Phone</p>
                        <p className="info-card-val">{college.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLACEMENTS */}
          {activeTab === 'placements' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h3 className="pane-title">Campus Placement Statistics</h3>
                <p className="pane-sub">Audited training and placement records.</p>
              </div>

              <div className="placement-kpis-grid">
                <div className="placement-kpi-card">
                  <p className="kpi-label">Highest Package</p>
                  <h3 className="kpi-value text-green">
                    ₹{college.placementStats?.highestPackage || '30.0'} LPA
                  </h3>
                  <p className="kpi-note">Highest compensation offered</p>
                </div>

                <div className="placement-kpi-card">
                  <p className="kpi-label">Average Package</p>
                  <h3 className="kpi-value text-blue">
                    ₹{college.placementStats?.averagePackage || '6.5'} LPA
                  </h3>
                  <p className="kpi-note">B.Tech median batch compensation</p>
                </div>

                <div className="placement-kpi-card">
                  <p className="kpi-label">Placement Rate</p>
                  <h3 className="kpi-value text-purple">
                    {college.placementStats?.placementPercentage || '88'}%
                  </h3>
                  <p className="kpi-note">Eligible graduating students placed</p>
                </div>
              </div>

              {college.placementStats?.topRecruiters?.length > 0 && (
                <div className="top-recruiters-section">
                  <h4 className="sub-block-title">Key Campus Recruiters</h4>
                  <div className="recruiters-chips-row">
                    {college.placementStats.topRecruiters.map((rec, idx) => (
                      <span key={idx} className="recruiter-chip">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="pane-header">
                <h3 className="pane-title">Student Reviews & Community Feedback</h3>
              </div>

              {/* Write Review Form */}
              <div className="write-review-card">
                <h4 className="write-review-title">Write a Review for {college.name}</h4>
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="review-input-form">
                    {reviewMessage && (
                      <div className="review-status-alert">{reviewMessage}</div>
                    )}
                    <div className="rating-select-row">
                      <label className="review-label">Your Rating (1 - 5):</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                        }
                        className="rating-select"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Average</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="review-label">Headline / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Great infrastructure, proactive placement cell"
                        value={reviewForm.title}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, title: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="review-label">Review Details</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe campus life, faculty, laboratories, and placements..."
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, comment: e.target.value })
                        }
                        className="form-textarea"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="btn-submit-review"
                    >
                      {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="login-to-review-box">
                    <p>You must be signed in as a student to write a review.</p>
                    <Link to="/login" className="btn-login-review">
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="reviews-list-wrap">
                {college.reviews?.length === 0 ? (
                  <p className="no-data-notice">No reviews posted yet. Be the first to review!</p>
                ) : (
                  college.reviews?.map((rev) => (
                    <div key={rev._id} className="review-item-card">
                      <div className="review-item-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="reviewer-name">{rev.user?.name || 'Verified Student'}</p>
                            <p className="review-date">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="review-stars-badge">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span>{rev.rating} / 5</span>
                        </div>
                      </div>
                      <h5 className="review-item-title">{rev.title}</h5>
                      <p className="review-item-body">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Direct Admission Enquiry Card & Quick Actions */}
        <aside className="details-sidebar-column">
          {/* Quick Action Buttons */}
          <div className="quick-actions-card">
            <button
              className={`btn-action-wishlist ${isWishlisted ? 'action-wishlisted' : ''}`}
              onClick={handleWishlistToggle}
            >
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
              <span>{isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Admission Enquiry Form */}
          <div className="admission-enquiry-card">
            <div className="enquiry-card-header">
              <Mail className="enquiry-card-icon" size={22} />
              <div>
                <h3 className="enquiry-card-title">Admission Enquiry</h3>
                <p className="enquiry-card-sub">Direct to {college.code} Admissions Desk</p>
              </div>
            </div>

            {enquirySuccess ? (
              <div className="enquiry-success-box">
                <CheckCircle size={40} className="success-icon" />
                <h4>Enquiry Submitted!</h4>
                <p>The college admissions office has received your query and will reply promptly.</p>
                <button
                  className="btn-enquire-again"
                  onClick={() => setEnquirySuccess(false)}
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="enquiry-card-form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, name: e.target.value })
                    }
                    className="form-input"
                    placeholder="Student name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, email: e.target.value })
                    }
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, phone: e.target.value })
                    }
                    className="form-input"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">TS EAMCET Rank</label>
                  <input
                    type="text"
                    value={enquiryForm.eamcetRank}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, eamcetRank: e.target.value })
                    }
                    className="form-input"
                    placeholder="e.g. 12500"
                  />
                </div>

                {college.courses?.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Preferred Branch</label>
                    <select
                      value={enquiryForm.courseId}
                      onChange={(e) =>
                        setEnquiryForm({ ...enquiryForm, courseId: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="">Any B.Tech Branch</option>
                      {college.courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Message / Query *</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryForm.message}
                    onChange={(e) =>
                      setEnquiryForm({ ...enquiryForm, message: e.target.value })
                    }
                    className="form-textarea"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="btn-card-submit-enquiry"
                >
                  {enquiryLoading ? 'Submitting...' : 'Submit Admission Enquiry'}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CollegeDetails;

