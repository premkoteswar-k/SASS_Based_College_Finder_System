import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Activity,
  FileText,
  Building2,
  Users,
} from 'lucide-react';
import { analyticsApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import './PlatformAnalytics.css';

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anRes, logsRes] = await Promise.all([
          analyticsApi.getSuperAdmin(),
          analyticsApi.getLogs(),
        ]);
        setAnalytics(anRes.data);
        setLogs(logsRes.data || []);
      } catch (err) {
        console.error('Failed to load analytics and audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const colleges = analytics?.colleges;
  const users = analytics?.users;
  const financials = analytics?.financials;
  const academics = analytics?.academics;
  const districts = analytics?.districtDistribution || [];

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">Platform Analytics & Audit Trail</h1>
            <p className="analytics-sub">
              Deep dive into system telemetry, district coverage, user conversion metrics, and tamper-evident activity logs.
            </p>
          </div>
        </div>

        {/* Academic & Conversion Overview Cards */}
        <div className="analytics-kpis-grid">
          <div className="analytics-kpi-card">
            <span className="akpi-lbl">Total Verified Courses</span>
            <h3 className="akpi-val">{academics?.totalCourses || 0}</h3>
            <span className="akpi-sub">Across all Telangana colleges</span>
          </div>

          <div className="analytics-kpi-card">
            <span className="akpi-lbl">Total Student Inquiries</span>
            <h3 className="akpi-val text-blue">{academics?.totalEnquiries || 0}</h3>
            <span className="akpi-sub">Admission leads generated</span>
          </div>

          <div className="analytics-kpi-card">
            <span className="akpi-lbl">Verified Student Reviews</span>
            <h3 className="akpi-val text-green">{academics?.totalReviews || 0}</h3>
            <span className="akpi-sub">Authentic ratings submitted</span>
          </div>

          <div className="analytics-kpi-card">
            <span className="akpi-lbl">Total SaaS Revenue</span>
            <h3 className="akpi-val text-purple">
              ₹{(financials?.totalRevenue || 0).toLocaleString('en-IN')}
            </h3>
            <span className="akpi-sub">Institutional subscriptions</span>
          </div>
        </div>

        {/* District Distribution Bar Visualizer */}
        <div className="analytics-section-card">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Telangana District Distribution</h3>
              <p className="section-sub">
                Institutions indexed per district in the state repository.
              </p>
            </div>
          </div>

          <div className="districts-bars-list">
            {districts.map((d, idx) => (
              <div key={idx} className="district-bar-item">
                <div className="dist-label-row">
                  <span className="dist-text-name">{d._id || 'Unknown'}</span>
                  <span className="dist-text-count">{d.count} Colleges</span>
                </div>
                <div className="dist-track">
                  <div className={`dist-fill fill-rank-${Math.min(idx, 4)}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tamper-evident Audit Logs Table */}
        <div className="analytics-section-card">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">System Audit Activity Log</h3>
              <p className="section-sub">
                Granular immutable event stream of user registrations, college approvals, and logins.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Loading audit logs...</p>
          ) : logs.length === 0 ? (
            <p className="no-data-text">No activity logs recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User & Role</th>
                    <th>Action Executed</th>
                    <th>Target Type</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="log-time-cell">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="log-user-wrap">
                          <span className="log-u-name">{log.userName}</span>
                          <span className="log-u-role">{log.userRole}</span>
                        </div>
                      </td>
                      <td>
                        <span className="log-action-badge">{log.action}</span>
                      </td>
                      <td>{log.targetType || 'System'}</td>
                      <td>
                        <code className="ip-code">{log.ipAddress || '127.0.0.1'}</code>
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

export default PlatformAnalytics;
