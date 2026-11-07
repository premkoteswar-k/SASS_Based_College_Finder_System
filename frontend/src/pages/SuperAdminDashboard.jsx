import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';
import { analyticsApi, collegeApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import Badge from '../components/Badge';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [pendingColleges, setPendingColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, collegesRes] = await Promise.all([
        analyticsApi.getSuperAdmin(),
        collegeApi.getAll({ approvedStatus: 'pending', limit: 10 }),
      ]);

      setData(analyticsRes.data);
      setPendingColleges(collegesRes.data || []);
    } catch (err) {
      console.error('Failed to load super admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveCollege = async (collegeId) => {
    try {
      await collegeApi.updateStatus(collegeId, {
        approvedStatus: 'approved',
        isVerified: true,
      });
      alert('College approved and marked as verified successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleRejectCollege = async (collegeId) => {
    if (!window.confirm('Reject this college application?')) return;
    try {
      await collegeApi.updateStatus(collegeId, {
        approvedStatus: 'rejected',
        isVerified: false,
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout-container">
        <Sidebar />
        <main className="dashboard-content-main">
          <div className="admin-loading-spinner">
            <div className="spinner-circle"></div>
            <p>Loading Super Admin platform analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  const colleges = data?.colleges;
  const users = data?.users;
  const financials = data?.financials;
  const academics = data?.academics;
  const districtDistribution = data?.districtDistribution || [];
  const recentLogs = data?.recentLogs || [];

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="superadmin-header">
          <div>
            <h1 className="superadmin-title">Super Admin Platform Control Center</h1>
            <p className="superadmin-sub">
              Telangana engineering ecosystem overview, institution onboarding, subscriptions, and governance.
            </p>
          </div>
          <div className="superadmin-top-actions">
            <Link to="/super-admin/colleges" className="btn-top-manage">
              Manage All Colleges
            </Link>
          </div>
        </div>

        {/* Top High-Level Metrics */}
        <div className="superadmin-metrics-grid">
          <StatsCard
            title="Total Colleges"
            value={colleges?.total || 0}
            subtitle={`${colleges?.approved || 0} approved • ${colleges?.pending || 0} pending`}
            icon={Building2}
            color="blue"
          />
          <StatsCard
            title="Registered Users"
            value={users?.total || 0}
            subtitle={`${users?.students || 0} Students • ${users?.collegeAdmins || 0} College Admins`}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="SaaS Subscriptions"
            value={financials?.activeSubscriptionsCount || 0}
            subtitle={`₹${(financials?.totalRevenue || 0).toLocaleString('en-IN')} Total Revenue`}
            icon={CreditCard}
            color="green"
          />
          <StatsCard
            title="Admission Inquiries"
            value={academics?.totalEnquiries || 0}
            subtitle={`${academics?.totalCourses || 0} Courses published`}
            icon={TrendingUp}
            color="amber"
          />
        </div>

        {/* Pending College Approvals Queue */}
        <div className="superadmin-panel-card">
          <div className="panel-header-row">
            <div>
              <div className="panel-title-with-badge">
                <h3 className="panel-title">Pending College Verification Queue</h3>
                {pendingColleges.length > 0 && (
                  <Badge type="warning" size="sm" label={`${pendingColleges.length} Action Required`} />
                )}
              </div>
              <p className="panel-sub">
                Review institution registrations before publishing them to the public Telangana directory.
              </p>
            </div>
          </div>

          {pendingColleges.length === 0 ? (
            <div className="empty-queue-view">
              <CheckCircle size={36} className="empty-check-icon" />
              <h4>All College Applications Reviewed</h4>
              <p>There are no pending registrations awaiting Super Admin approval.</p>
            </div>
          ) : (
            <div className="table-responsive-wrap">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th>College Name & Code</th>
                    <th>District</th>
                    <th>Type & Affiliation</th>
                    <th>Submitted On</th>
                    <th>Verification Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingColleges.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="college-cell-wrap">
                          <span className="c-code">{c.code}</span>
                          <span className="c-name">{c.name}</span>
                        </div>
                      </td>
                      <td>{c.district}, Telangana</td>
                      <td>
                        <div className="type-cell-wrap">
                          <span>{c.type}</span>
                          <span className="sub-affiliation">{c.affiliation}</span>
                        </div>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="decision-actions-row">
                          <button
                            className="btn-approve-verify"
                            onClick={() => handleApproveCollege(c._id)}
                          >
                            <CheckCircle size={14} />
                            <span>Approve & Verify</span>
                          </button>
                          <button
                            className="btn-reject-college"
                            onClick={() => handleRejectCollege(c._id)}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Two-Column Grid: District Distribution & Recent Activity Logs */}
        <div className="superadmin-two-cols-grid">
          {/* District Breakdown */}
          <div className="superadmin-panel-card">
            <h3 className="panel-title">District College Density</h3>
            <p className="panel-sub">Top Telangana engineering hubs by listed institutions.</p>

            <div className="district-breakdown-list">
              {districtDistribution.map((d, idx) => (
                <div key={idx} className="district-row">
                  <div className="dist-name-row">
                    <MapPin size={16} className="dist-icon" />
                    <span className="dist-name">{d._id || 'Unknown District'}</span>
                  </div>
                  <span className="dist-counter-badge">{d.count} Colleges</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs Stream */}
          <div className="superadmin-panel-card">
            <h3 className="panel-title">Recent System Activity Audit</h3>
            <p className="panel-sub">Audit logs of administrative actions and signups.</p>

            <div className="logs-stream-list">
              {recentLogs.map((log) => (
                <div key={log._id} className="log-item">
                  <div className="log-dot"></div>
                  <div className="log-content">
                    <p className="log-action-text">
                      <strong>{log.userName}</strong> ({log.userRole}): {log.action}
                    </p>
                    <span className="log-timestamp">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

