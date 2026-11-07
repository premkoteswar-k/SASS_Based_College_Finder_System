import React, { useState, useEffect } from 'react';
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  User,
  ExternalLink,
} from 'lucide-react';
import { enquiryApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import './ManageEnquiries.css';

const ManageEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Response Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responseStatus, setResponseStatus] = useState('resolved');
  const [responseNote, setResponseNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await enquiryApi.getAll(params);
      setEnquiries(res.data || []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const openRespondModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setResponseStatus(enquiry.status === 'pending' ? 'resolved' : enquiry.status);
    setResponseNote(enquiry.responseNote || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      setUpdating(true);
      const res = await enquiryApi.updateStatus(selectedEnquiry._id, {
        status: responseStatus,
        responseNote,
      });

      // Update in local state
      setEnquiries(
        enquiries.map((enq) =>
          enq._id === selectedEnquiry._id ? res.data : enq
        )
      );
      setSelectedEnquiry(null);
    } catch (err) {
      alert(err.message || 'Failed to update enquiry status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="enquiries-manager-header">
          <div>
            <h1 className="enquiries-title">Student Admission Enquiries</h1>
            <p className="enquiries-subtitle">
              Manage prospective B.Tech student enquiries, update counseling status, and send official replies.
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="enquiry-filter-tabs">
          {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              className={`enquiry-tab-pill ${statusFilter === status ? 'tab-pill-active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              <span className="pill-label">
                {status === 'all'
                  ? 'All Enquiries'
                  : status === 'in_progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Content Table Card */}
        <div className="enquiries-card-wrap">
          {loading ? (
            <div className="enquiries-loading-state">
              <div className="spinner-circle"></div>
              <p>Fetching admission leads...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="enquiries-empty-state">
              <Mail size={44} className="empty-icon" />
              <h3>No enquiries found under "{statusFilter}" status</h3>
              <p>When students enquire on your college profile, their leads will show up here.</p>
            </div>
          ) : (
            <div className="enquiries-table-responsive">
              <table className="enquiries-admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Contact Info</th>
                    <th>EAMCET Rank</th>
                    <th>Branch Inquired</th>
                    <th>Inquiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => (
                    <tr key={enq._id}>
                      <td>
                        <div className="student-name-col">
                          <span className="s-name">{enq.name}</span>
                          <span className="s-msg-snippet">{enq.message}</span>
                        </div>
                      </td>
                      <td>
                        <div className="student-contact-col">
                          <span>{enq.email}</span>
                          <span className="phone-text">{enq.phone}</span>
                        </div>
                      </td>
                      <td>
                        {enq.eamcetRank ? (
                          <span className="rank-tag">{enq.eamcetRank}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{enq.course?.name || 'General Query'}</td>
                      <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                      <td>
                        {enq.status === 'pending' && <Badge type="warning" size="sm" label="Pending" />}
                        {enq.status === 'in_progress' && <Badge type="info" size="sm" label="In Progress" />}
                        {enq.status === 'resolved' && <Badge type="success" size="sm" label="Resolved" />}
                        {enq.status === 'closed' && <Badge type="danger" size="sm" label="Closed" />}
                      </td>
                      <td>
                        <button
                          className="btn-respond-action"
                          onClick={() => openRespondModal(enq)}
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Respond / Update Status Modal */}
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title={`Respond to Enquiry: ${selectedEnquiry?.name}`}
          size="md"
        >
          {selectedEnquiry && (
            <form onSubmit={handleUpdateStatus} className="modal-respond-form">
              <div className="enquiry-preview-box">
                <p>
                  <strong>Email:</strong> {selectedEnquiry.email} |{' '}
                  <strong>Phone:</strong> {selectedEnquiry.phone}
                </p>
                {selectedEnquiry.eamcetRank && (
                  <p>
                    <strong>TS EAMCET Rank:</strong> {selectedEnquiry.eamcetRank}
                  </p>
                )}
                <div className="preview-message-block">
                  <span className="preview-msg-label">Student's Inquiry:</span>
                  <p className="preview-msg-text">{selectedEnquiry.message}</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Update Status *</label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="pending">Pending Review</option>
                  <option value="in_progress">In Progress (Contacting Student)</option>
                  <option value="resolved">Resolved (Offer Sent / Call Completed)</option>
                  <option value="closed">Closed / Not Interested</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Official Admission Desk Response / Internal Note
                </label>
                <textarea
                  rows={4}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="form-textarea"
                  placeholder="e.g. Discussed fee waiver and hostel seats with student. Invited for campus counseling visit on Monday."
                ></textarea>
                <span className="note-hint">
                  This note will be recorded and visible on the student's dashboard.
                </span>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-save-response"
              >
                {updating ? 'Updating Status...' : 'Save & Notify Student'}
              </button>
            </form>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default ManageEnquiries;

