import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  GitCompare,
  Building2,
  CheckCircle,
  X,
} from 'lucide-react';
import { collegeApi, enquiryApi } from '../utils/api';
import CollegeCard from '../components/CollegeCard';
import Modal from '../components/Modal';
import './Colleges.css';

const Colleges = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [affiliation, setAffiliation] = useState(searchParams.get('affiliation') || '');
  const [isVerified, setIsVerified] = useState(searchParams.get('isVerified') === 'true');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Compare selection
  const [comparedColleges, setComparedColleges] = useState([]);

  // Quick Enquiry Modal
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedCollegeForEnquiry, setSelectedCollegeForEnquiry] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    eamcetRank: '',
    message: 'I am interested in admission for the upcoming academic year. Please provide course and fee details.',
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Load districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await collegeApi.getDistricts();
        setDistricts(res.data || []);
      } catch (err) {
        console.error('Failed to load districts', err);
      }
    };
    fetchDistricts();
  }, []);

  // Fetch colleges whenever filter changes
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 24,
          sortBy,
          sortOrder,
        };
        if (search) params.search = search;
        if (district && district !== 'All') params.district = district;
        if (type && type !== 'All') params.type = type;
        if (affiliation && affiliation !== 'All') params.affiliation = affiliation;
        if (isVerified) params.isVerified = 'true';

        const res = await collegeApi.getAll(params);
        setColleges(res.data || []);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.error('Failed to fetch colleges', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [search, district, type, affiliation, isVerified, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSearch('');
    setDistrict('');
    setType('');
    setAffiliation('');
    setIsVerified(false);
    setSortBy('name');
    setSortOrder('asc');
    setSearchParams({});
  };

  const handleCompareToggle = (college) => {
    const exists = comparedColleges.find((c) => c._id === college._id);
    if (exists) {
      setComparedColleges(comparedColleges.filter((c) => c._id !== college._id));
    } else {
      if (comparedColleges.length >= 3) {
        alert('You can compare a maximum of 3 colleges simultaneously.');
        return;
      }
      setComparedColleges([...comparedColleges, college]);
    }
  };

  const openEnquiryModal = (college) => {
    setSelectedCollegeForEnquiry(college);
    setEnquirySuccess(false);
    setEnquiryModalOpen(true);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollegeForEnquiry) return;

    try {
      setEnquirySubmitting(true);
      await enquiryApi.create({
        collegeId: selectedCollegeForEnquiry._id,
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        eamcetRank: enquiryForm.eamcetRank,
        message: enquiryForm.message,
      });
      setEnquirySuccess(true);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        eamcetRank: '',
        message: 'I am interested in admission for the upcoming academic year. Please provide course and fee details.',
      });
    } catch (err) {
      alert(err.message || 'Failed to submit admission enquiry');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const navigateToCompare = () => {
    const ids = comparedColleges.map((c) => c._id).join(',');
    navigate(`/compare?colleges=${ids}`);
  };

  return (
    <div className="colleges-page-container">
      {/* Top Banner */}
      <div className="colleges-header-banner">
        <div className="colleges-header-inner">
          <h1 className="colleges-main-title">Telangana B.Tech Colleges Directory</h1>
          <p className="colleges-main-subtext">
            Search, filter, and compare accredited engineering institutes across Hyderabad, Yadadri Bhuvanagiri, Rangareddy, and other districts.
          </p>
        </div>
      </div>

      <div className="colleges-layout-wrap">
        {/* Filter Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-sidebar-header">
            <div className="filters-header-title">
              <Filter size={18} />
              <span>Filters</span>
            </div>
            <button className="btn-reset-filters" onClick={handleResetFilters}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          <div className="filters-sidebar-content">
            {/* Search Input Filter */}
            <div className="filter-group">
              <label className="filter-label">Search Keyword</label>
              <div className="filter-input-wrap">
                <Search size={16} className="filter-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Vignan, CBIT, JNTU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="filter-text-input"
                />
              </div>
            </div>

            {/* District Filter */}
            <div className="filter-group">
              <label className="filter-label">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="filter-select"
              >
                <option value="">All Telangana Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Affiliation Filter */}
            <div className="filter-group">
              <label className="filter-label">Affiliation</label>
              <select
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="filter-select"
              >
                <option value="">All Affiliations</option>
                <option value="JNTUH">JNTU Hyderabad (JNTUH)</option>
                <option value="Osmania University">Osmania University (OU)</option>
                <option value="Kakatiya University">Kakatiya University (KU)</option>
                <option value="Autonomous">Autonomous Colleges</option>
              </select>
            </div>

            {/* Institution Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Institution Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="Autonomous">Autonomous</option>
                <option value="University College">University College</option>
                <option value="Affiliated">Affiliated</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* Verification Checkbox */}
            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="checkbox-text">Verified Colleges Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content: Listing & Results */}
        <main className="colleges-results-main">
          {/* Controls Bar */}
          <div className="results-controls-bar">
            <div className="results-counter">
              <span className="counter-bold">{totalCount}</span> Colleges Found
            </div>

            <div className="sort-controls">
              <label className="sort-label">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">College Name (A - Z)</option>
                <option value="rating">Highest Rating</option>
                <option value="year">Establishment Year</option>
              </select>
            </div>
          </div>

          {/* Colleges Grid */}
          {loading ? (
            <div className="colleges-loading-state">
              <div className="spinner-circle"></div>
              <p>Searching Telangana colleges database...</p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="colleges-empty-state">
              <Building2 size={48} className="empty-icon" />
              <h3 className="empty-title">No colleges found matching criteria</h3>
              <p className="empty-desc">
                Try modifying your search keywords or clearing some filters to view more institutions.
              </p>
              <button className="btn-clear-empty" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="colleges-grid-container">
              {colleges.map((college) => {
                const isCompared = !!comparedColleges.find((c) => c._id === college._id);
                return (
                  <CollegeCard
                    key={college._id}
                    college={college}
                    onEnquireClick={openEnquiryModal}
                    onCompareToggle={handleCompareToggle}
                    isCompared={isCompared}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Compare Tray if colleges selected */}
      {comparedColleges.length > 0 && (
        <div className="compare-floating-tray">
          <div className="tray-info">
            <GitCompare size={20} className="tray-icon" />
            <span>
              <strong>{comparedColleges.length} / 3</strong> Colleges selected for comparison
            </span>
            <div className="tray-chips">
              {comparedColleges.map((c) => (
                <span key={c._id} className="tray-chip">
                  {c.code}
                  <button
                    onClick={() => handleCompareToggle(c)}
                    className="chip-remove-btn"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="tray-actions">
            <button
              className="btn-tray-clear"
              onClick={() => setComparedColleges([])}
            >
              Clear
            </button>
            <button className="btn-tray-compare" onClick={navigateToCompare}>
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Quick Admission Enquiry Modal */}
      <Modal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        title={
          selectedCollegeForEnquiry
            ? `Enquire: ${selectedCollegeForEnquiry.name}`
            : 'Admission Enquiry'
        }
      >
        {enquirySuccess ? (
          <div className="enquiry-success-view">
            <CheckCircle size={48} className="success-icon" />
            <h4 className="success-title">Enquiry Submitted Successfully!</h4>
            <p className="success-desc">
              Your inquiry has been delivered directly to the admissions desk of{' '}
              <strong>{selectedCollegeForEnquiry?.name}</strong>. The college will contact you via email or phone.
            </p>
            <button
              className="btn-close-success"
              onClick={() => setEnquiryModalOpen(false)}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="modal-enquiry-form" onSubmit={handleEnquirySubmit}>
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
                placeholder="Enter your student full name"
              />
            </div>

            <div className="form-row-2">
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
                  placeholder="student@example.com"
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
            </div>

            <div className="form-group">
              <label className="form-label">TS EAMCET / JEE Main Rank</label>
              <input
                type="text"
                value={enquiryForm.eamcetRank}
                onChange={(e) =>
                  setEnquiryForm({ ...enquiryForm, eamcetRank: e.target.value })
                }
                className="form-input"
                placeholder="e.g. 15420 or Awaiting results"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Message / Query *</label>
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
              disabled={enquirySubmitting}
              className="btn-submit-enquiry"
            >
              {enquirySubmitting ? 'Submitting to College...' : 'Send Enquiry Now'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Colleges;

