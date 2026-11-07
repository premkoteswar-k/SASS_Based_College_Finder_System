import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Check,
  X,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { collegeApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import './ManageColleges.css';

const ManageColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add College Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newCollegeForm, setNewCollegeForm] = useState({
    name: '',
    code: '',
    district: 'Hyderabad',
    affiliation: 'JNTUH',
    type: 'Affiliated',
    contactEmail: '',
    contactPhone: '',
    website: '',
    approvedStatus: 'approved',
    isVerified: true,
  });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (statusFilter !== 'all') params.approvedStatus = statusFilter;
      if (search) params.search = search;

      const res = await collegeApi.getAll(params);
      setColleges(res.data || []);
    } catch (err) {
      console.error('Failed to load colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [statusFilter, search]);

  const handleStatusChange = async (id, status) => {
    try {
      await collegeApi.updateStatus(id, { approvedStatus: status });
      fetchColleges();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleToggleVerified = async (id, currentVal) => {
    try {
      await collegeApi.updateStatus(id, { isVerified: !currentVal });
      fetchColleges();
    } catch (err) {
      alert(err.message || 'Failed to toggle verification');
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      await collegeApi.updateStatus(id, { featured: !currentVal });
      fetchColleges();
    } catch (err) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}" and all associated courses & records?`)) {
      return;
    }
    try {
      await collegeApi.delete(id);
      setColleges(colleges.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete college');
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setErrorMsg('');
      await collegeApi.create(newCollegeForm);
      setModalOpen(false);
      setNewCollegeForm({
        name: '',
        code: '',
        district: 'Hyderabad',
        affiliation: 'JNTUH',
        type: 'Affiliated',
        contactEmail: '',
        contactPhone: '',
        website: '',
        approvedStatus: 'approved',
        isVerified: true,
      });
      fetchColleges();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register college');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="manage-colleges-header">
          <div>
            <h1 className="manage-colleges-title">Manage Telangana Colleges</h1>
            <p className="manage-colleges-sub">
              Platform-wide governance: verify institutions, moderate listings, and onboard new campuses.
            </p>
          </div>

          <button className="btn-add-new-college" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            <span>Onboard New College</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-controls-bar">
          <div className="search-box-wrap">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by college name, code, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="manage-search-input"
            />
          </div>

          <div className="status-filter-pills">
            {['all', 'approved', 'pending', 'rejected'].map((st) => (
              <button
                key={st}
                className={`st-pill-btn ${statusFilter === st ? 'st-pill-active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'all' ? 'All Colleges' : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Colleges Table */}
        <div className="manage-colleges-card">
          {loading ? (
            <div className="table-loading-view">
              <div className="spinner-circle"></div>
              <p>Loading colleges directory...</p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="table-empty-view">
              <Building2 size={44} className="empty-icon" />
              <h3>No colleges found matching criteria</h3>
              <p>Adjust your search query or filter settings.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="superadmin-colleges-table">
                <thead>
                  <tr>
                    <th>Code & Name</th>
                    <th>District</th>
                    <th>Affiliation & Type</th>
                    <th>Verified</th>
                    <th>Featured</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((col) => (
                    <tr key={col._id}>
                      <td>
                        <div className="col-info-cell">
                          <span className="col-code-tag">{col.code}</span>
                          <span className="col-name-bold">{col.name}</span>
                        </div>
                      </td>
                      <td>{col.district}</td>
                      <td>
                        <div className="col-type-cell">
                          <span>{col.type}</span>
                          <span className="col-sub-aff">{col.affiliation}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`btn-toggle-switch ${col.isVerified ? 'switch-on' : 'switch-off'}`}
                          onClick={() => handleToggleVerified(col._id, col.isVerified)}
                          title="Toggle Verification Badge"
                        >
                          {col.isVerified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td>
                        <button
                          className={`btn-toggle-switch ${col.featured ? 'switch-on' : 'switch-off'}`}
                          onClick={() => handleToggleFeatured(col._id, col.featured)}
                          title="Toggle Featured Partner Status"
                        >
                          {col.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>
                      <td>
                        <select
                          value={col.approvedStatus}
                          onChange={(e) => handleStatusChange(col._id, e.target.value)}
                          className="status-dropdown-select"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className="col-action-btns">
                          <Link
                            to={`/colleges/${col.slug || col._id}`}
                            target="_blank"
                            className="btn-action-view"
                            title="View Public Profile"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            className="btn-action-del"
                            onClick={() => handleDelete(col._id, col.name)}
                            title="Delete College"
                          >
                            <Trash2 size={15} />
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

        {/* Modal: Onboard New College */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Onboard New Engineering College"
          size="md"
        >
          {errorMsg && <div className="modal-error-alert">{errorMsg}</div>}

          <form onSubmit={handleCreateCollege} className="onboard-college-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">College Name *</label>
                <input
                  type="text"
                  required
                  value={newCollegeForm.name}
                  onChange={(e) =>
                    setNewCollegeForm({ ...newCollegeForm, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g. Vignan Institute of Technology & Science"
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Code (e.g. VGNT) *</label>
                <input
                  type="text"
                  required
                  value={newCollegeForm.code}
                  onChange={(e) =>
                    setNewCollegeForm({
                      ...newCollegeForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="form-input"
                  placeholder="VGNT"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">District in Telangana *</label>
                <input
                  type="text"
                  required
                  value={newCollegeForm.district}
                  onChange={(e) =>
                    setNewCollegeForm({ ...newCollegeForm, district: e.target.value })
                  }
                  className="form-input"
                  placeholder="Yadadri Bhuvanagiri"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institution Type</label>
                <select
                  value={newCollegeForm.type}
                  onChange={(e) =>
                    setNewCollegeForm({ ...newCollegeForm, type: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="Autonomous">Autonomous</option>
                  <option value="Affiliated">Affiliated</option>
                  <option value="University College">University College</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">University Affiliation</label>
              <input
                type="text"
                value={newCollegeForm.affiliation}
                onChange={(e) =>
                  setNewCollegeForm({ ...newCollegeForm, affiliation: e.target.value })
                }
                className="form-input"
                placeholder="Jawaharlal Nehru Technological University Hyderabad (JNTUH)"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Admissions Email</label>
                <input
                  type="email"
                  value={newCollegeForm.contactEmail}
                  onChange={(e) =>
                    setNewCollegeForm({
                      ...newCollegeForm,
                      contactEmail: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="admissions@college.edu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  value={newCollegeForm.contactPhone}
                  onChange={(e) =>
                    setNewCollegeForm({
                      ...newCollegeForm,
                      contactPhone: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="08685-226128"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn-submit-onboard"
            >
              {creating ? 'Registering...' : 'Register & Verify College'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ManageColleges;

