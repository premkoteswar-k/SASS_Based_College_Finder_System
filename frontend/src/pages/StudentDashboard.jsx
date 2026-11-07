import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Heart,
  User,
  Clock,
  CheckCircle,
  Building2,
  Trash2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { enquiryApi, wishlistApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries', 'wishlist', 'profile'
  const [enquiries, setEnquiries] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [enqRes, wishRes] = await Promise.all([
          enquiryApi.getAll(),
          wishlistApi.get(),
        ]);
        setEnquiries(enqRes.data || []);
        setWishlist(wishRes.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  const handleRemoveWishlist = async (collegeId) => {
    try {
      await wishlistApi.remove(collegeId);
      setWishlist(wishlist.filter((c) => c._id !== collegeId));
    } catch (err) {
      alert(err.message || 'Failed to remove from wishlist');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileStatus('Profile updated successfully!');
      setTimeout(() => setProfileStatus(''), 4000);
    } catch (err) {
      setProfileStatus(`Error: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Welcome Header */}
        <div className="student-header-card">
          <div>
            <h1 className="student-welcome-title">Welcome back, {user?.name}!</h1>
            <p className="student-welcome-sub">
              Manage your engineering admission applications, saved colleges, and enquiry updates.
            </p>
          </div>
          <Link to="/colleges" className="btn-explore-shortcut">
            Explore More Colleges
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="student-kpi-grid">
          <div className="student-kpi-card">
            <div className="kpi-icon-box bg-blue">
              <Mail size={22} />
            </div>
            <div>
              <p className="kpi-label">Enquiries Submitted</p>
              <h3 className="kpi-val">{enquiries.length}</h3>
            </div>
          </div>

          <div className="student-kpi-card">
            <div className="kpi-icon-box bg-rose">
              <Heart size={22} />
            </div>
            <div>
              <p className="kpi-label">Saved to Wishlist</p>
              <h3 className="kpi-val">{wishlist.length}</h3>
            </div>
          </div>

          <div className="student-kpi-card">
            <div className="kpi-icon-box bg-green">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="kpi-label">Responses Received</p>
              <h3 className="kpi-val">
                {enquiries.filter((e) => e.status === 'resolved' || e.responseNote).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="student-tabs-row">
          <button
            className={`student-tab-btn ${activeTab === 'enquiries' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <Mail size={16} />
            <span>Admission Enquiries ({enquiries.length})</span>
          </button>
          <button
            className={`student-tab-btn ${activeTab === 'wishlist' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={16} />
            <span>Saved Wishlist ({wishlist.length})</span>
          </button>
          <button
            className={`student-tab-btn ${activeTab === 'profile' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* TAB 1: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="student-tab-card">
            <div className="tab-card-header">
              <h3 className="tab-title">Your Submitted Admission Enquiries</h3>
              <p className="tab-sub">Real-time status updates directly from college admission desks.</p>
            </div>

            {loading ? (
              <p className="loading-text">Loading your enquiries...</p>
            ) : enquiries.length === 0 ? (
              <div className="empty-panel">
                <Mail size={40} className="empty-panel-icon" />
                <h4>No Enquiries Submitted Yet</h4>
                <p>Discover colleges in our directory and send your queries to admission teams.</p>
                <Link to="/colleges" className="btn-primary-action">
                  Find Colleges
                </Link>
              </div>
            ) : (
              <div className="enquiries-list-wrap">
                {enquiries.map((enq) => (
                  <div key={enq._id} className="enquiry-student-item">
                    <div className="enquiry-item-top">
                      <div className="enquiry-college-title">
                        <Building2 size={18} className="college-icon" />
                        <span className="college-name-bold">{enq.college?.name}</span>
                        <span className="college-code-pill">{enq.college?.code}</span>
                      </div>
                      <div className="enquiry-status-badge">
                        {enq.status === 'pending' && <Badge type="warning" label="Pending Review" />}
                        {enq.status === 'in_progress' && <Badge type="info" label="In Progress" />}
                        {enq.status === 'resolved' && <Badge type="success" label="Resolved / Responded" />}
                        {enq.status === 'closed' && <Badge type="danger" label="Closed" />}
                      </div>
                    </div>

                    <div className="enquiry-details-row">
                      <span className="enquiry-meta-text">
                        <strong>Date:</strong> {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                      {enq.course && (
                        <span className="enquiry-meta-text">
                          <strong>Course:</strong> {enq.course.name} ({enq.course.degree})
                        </span>
                      )}
                      {enq.eamcetRank && (
                        <span className="enquiry-meta-text">
                          <strong>TS EAMCET Rank:</strong> {enq.eamcetRank}
                        </span>
                      )}
                    </div>

                    <div className="enquiry-message-box">
                      <p className="message-label">Your Inquiry:</p>
                      <p className="message-text">{enq.message}</p>
                    </div>

                    {enq.responseNote && (
                      <div className="college-response-box">
                        <p className="response-label">
                          Official Response from {enq.college?.code || 'College'} Admission Desk:
                        </p>
                        <p className="response-text">{enq.responseNote}</p>
                        {enq.respondedAt && (
                          <span className="response-date">
                            Replied on {new Date(enq.respondedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="student-tab-card">
            <div className="tab-card-header">
              <h3 className="tab-title">Saved Wishlist Colleges</h3>
              <p className="tab-sub">Colleges you have bookmarked for quick review and comparison.</p>
            </div>

            {loading ? (
              <p className="loading-text">Loading saved colleges...</p>
            ) : wishlist.length === 0 ? (
              <div className="empty-panel">
                <Heart size={40} className="empty-panel-icon" />
                <h4>Your Wishlist is Empty</h4>
                <p>Browse the directory and click the heart icon on any college card to save it here.</p>
                <Link to="/colleges" className="btn-primary-action">
                  Browse Colleges
                </Link>
              </div>
            ) : (
              <div className="wishlist-cards-grid">
                {wishlist.map((col) => (
                  <div key={col._id} className="wishlist-item-card">
                    <div className="wishlist-card-media">
                      <img
                        src={col.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&auto=format&fit=crop&q=80'}
                        alt={col.name}
                        className="wishlist-col-img"
                      />
                      <button
                        className="btn-trash-wishlist"
                        onClick={() => handleRemoveWishlist(col._id)}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="wishlist-card-content">
                      <span className="wishlist-code">{col.code}</span>
                      <h4 className="wishlist-title">{col.name}</h4>
                      <p className="wishlist-district">{col.district}, Telangana</p>
                      <Link
                        to={`/colleges/${col._id}`}
                        className="btn-view-wishlist-col"
                      >
                        <span>View Profile & Fees</span>
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="student-tab-card">
            <div className="tab-card-header">
              <h3 className="tab-title">Student Profile Settings</h3>
              <p className="tab-sub">Manage your personal information and contact preferences.</p>
            </div>

            {profileStatus && <div className="profile-status-alert">{profileStatus}</div>}

            <form onSubmit={handleUpdateProfile} className="student-profile-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-input input-disabled"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="form-input"
                  placeholder="+91 9876543210"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="btn-save-profile"
              >
                <Save size={16} />
                <span>{profileSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;

