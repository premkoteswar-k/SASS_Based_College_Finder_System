import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  BookOpen,
  Award,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { analyticsApi, enquiryApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import Badge from '../components/Badge';
import './CollegeAdminDashboard.css';

const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getCollegeAdmin();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load college admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar />
        <main className="dashboard-content-main">
          <div className="admin-loading-spinner">
            <div className="spinner-circle"></div>
            <p>Loading your college portal dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const college = data?.college;
  const stats = data?.stats;
  const subscription = data?.subscription;
  const recentEnquiries = data?.recentEnquiries || [];

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Top College Header Banner */}
        <div className="college-header-card">
          <div className="college-header-left">
            <div className="college-code-circle">
              {college?.code || 'VGNT'}
            </div>
            <div>
              <div className="college-title-row">
                <h1 className="college-admin-name">{college?.name || 'Vignan Institute of Tech & Sciences'}</h1>
                {college?.isVerified && (
                  <Badge type="success" size="md" icon={ShieldCheck} label="Verified by Super Admin" />
                )}
                {college?.approvedStatus === 'pending' && (
                  <Badge type="warning" size="md" label="Pending Super Admin Approval" />
                )}
              </div>
              <p className="college-admin-sub">
                Official College Administration Portal • Telangana Higher Education Directory
              </p>
            </div>
          </div>

          <div className="college-header-actions">
            <Link to="/college-admin/profile" className="btn-edit-profile-top">
              Edit College Profile
            </Link>
            <Link
              to={`/colleges/${college?.id}`}
              target="_blank"
              className="btn-view-public"
            >
              <span>View Public Page</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Subscription Plan Alert Banner */}
        <div className="subscription-notice-banner">
          <div className="sub-notice-left">
            <Award size={22} className="sub-award-icon" />
            <div>
              <span className="sub-tag">Active Plan: {subscription?.planName}</span>
              <p className="sub-desc">
                Your college has <strong>{subscription?.daysRemaining || 365} days</strong> remaining on this billing cycle. Max Course allowance: <strong>{subscription?.maxCourses} branches</strong>.
              </p>
            </div>
          </div>
          <Link to="/college-admin/subscription" className="btn-upgrade-plan">
            Upgrade / Renew Plan
          </Link>
        </div>

        {/* Analytics KPIs Grid */}
        <div className="admin-stats-grid">
          <StatsCard
            title="Total Enquiries"
            value={stats?.totalEnquiries || 0}
            subtitle="Admission leads received"
            icon={Mail}
            color="blue"
          />
          <StatsCard
            title="Pending Follow-up"
            value={stats?.pendingEnquiries || 0}
            subtitle="Requires admission desk review"
            icon={Clock}
            color="amber"
          />
          <StatsCard
            title="Branches Listed"
            value={`${stats?.coursesCount || 0} / ${subscription?.maxCourses || 5}`}
            subtitle="Active B.Tech specializations"
            icon={BookOpen}
            color="purple"
          />
          <StatsCard
            title="Rating & Feedback"
            value={`${college?.rating ? college.rating.toFixed(1) : '4.5'} ★`}
            subtitle={`${stats?.reviewsCount || 0} student verified reviews`}
            icon={Star}
            color="green"
          />
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="quick-action-shortcuts-strip">
          <h3 className="shortcuts-title">Quick Management Actions:</h3>
          <div className="shortcuts-buttons-row">
            <Link to="/college-admin/courses" className="shortcut-btn">
              <PlusCircle size={16} />
              <span>Add / Manage Courses</span>
            </Link>
            <Link to="/college-admin/enquiries" className="shortcut-btn">
              <Mail size={16} />
              <span>Review Inquiries ({stats?.pendingEnquiries || 0} Pending)</span>
            </Link>
            <Link to="/college-admin/profile" className="shortcut-btn">
              <Building2 size={16} />
              <span>Update Cutoffs & Placement Stats</span>
            </Link>
            <Link to="/college-admin/subscription" className="shortcut-btn">
              <Award size={16} />
              <span>SaaS Subscription Features</span>
            </Link>
          </div>
        </div>

        {/* Recent Enquiries Table Section */}
        <div className="admin-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-card-title">Recent Admission Enquiries</h3>
              <p className="section-card-sub">
                Students awaiting callback or counseling regarding B.Tech admissions.
              </p>
            </div>
            <Link to="/college-admin/enquiries" className="section-view-all">
              <span>View All Enquiries</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="empty-table-state">
              <Mail size={36} className="empty-mail-icon" />
              <p>No admission enquiries received yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email & Contact</th>
                    <th>Course Inquired</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map((enq) => (
                    <tr key={enq._id}>
                      <td className="font-bold">{enq.name}</td>
                      <td>
                        <div className="contact-col">
                          <span>{enq.email}</span>
                          <span className="contact-sub">{enq.phone}</span>
                        </div>
                      </td>
                      <td>{enq.course?.name || 'General Admission Query'}</td>
                      <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                      <td>
                        {enq.status === 'pending' && <Badge type="warning" size="sm" label="Pending" />}
                        {enq.status === 'in_progress' && <Badge type="info" size="sm" label="In Progress" />}
                        {enq.status === 'resolved' && <Badge type="success" size="sm" label="Resolved" />}
                        {enq.status === 'closed' && <Badge type="danger" size="sm" label="Closed" />}
                      </td>
                      <td>
                        <Link
                          to="/college-admin/enquiries"
                          className="btn-respond-link"
                        >
                          Respond
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CollegeAdminDashboard;

