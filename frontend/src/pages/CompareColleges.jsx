import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Plus,
  Trash2,
  Check,
  X,
  Star,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { collegeApi } from '../utils/api';
import Badge from '../components/Badge';
import './CompareColleges.css';

const CompareColleges = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allColleges, setAllColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all colleges for dropdown selector
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await collegeApi.getAll({ limit: 100 });
        const list = res.data || [];
        setAllColleges(list);

        // Check if query params specified colleges
        const ids = searchParams.get('colleges');
        if (ids) {
          const splitIds = ids.split(',').filter(Boolean);
          const matched = list.filter((c) => splitIds.includes(c._id));
          setSelectedColleges(matched.slice(0, 3));
        } else if (list.length >= 2) {
          // Default pre-select first 2 colleges (e.g. VGNT and JNTUH)
          setSelectedColleges(list.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load colleges for compare:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [searchParams]);

  const handleAddCollege = (collegeId) => {
    if (!collegeId) return;
    const found = allColleges.find((c) => c._id === collegeId);
    if (!found) return;

    if (selectedColleges.some((c) => c._id === collegeId)) {
      alert('This college is already in the comparison table.');
      return;
    }

    if (selectedColleges.length >= 3) {
      alert('You can compare a maximum of 3 colleges simultaneously.');
      return;
    }

    const updated = [...selectedColleges, found];
    setSelectedColleges(updated);
    setSearchParams({ colleges: updated.map((c) => c._id).join(',') });
  };

  const handleRemoveSlot = (index) => {
    const updated = selectedColleges.filter((_, idx) => idx !== index);
    setSelectedColleges(updated);
    setSearchParams({ colleges: updated.map((c) => c._id).join(',') });
  };

  return (
    <div className="compare-page-container">
      {/* Top Header */}
      <div className="compare-header-banner">
        <div className="compare-header-inner">
          <div className="compare-badge">
            <GitCompare size={14} />
            <span>Side-by-Side College Matrix</span>
          </div>
          <h1 className="compare-title">Compare Telangana Engineering Colleges</h1>
          <p className="compare-subtitle">
            Evaluate affiliations, autonomous status, NAAC grades, placement statistics, and key recruiters side by side to make an informed career decision.
          </p>
        </div>
      </div>

      <div className="compare-content-wrap">
        {/* College Selector Bar */}
        <div className="compare-selector-bar">
          <span className="selector-bar-label">Add a college to compare:</span>
          <select
            className="compare-dropdown-select"
            onChange={(e) => {
              handleAddCollege(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select a college from directory...
            </option>
            {allColleges.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code}) - {c.district}
              </option>
            ))}
          </select>
          <span className="slots-counter">
            Slots filled: {selectedColleges.length} / 3
          </span>
        </div>

        {/* Comparison Matrix Table */}
        {selectedColleges.length === 0 ? (
          <div className="compare-empty-view">
            <GitCompare size={48} className="empty-compare-icon" />
            <h3>No Colleges Selected</h3>
            <p>Select at least 2 colleges from the dropdown above to start comparing.</p>
          </div>
        ) : (
          <div className="matrix-table-card">
            <table className="compare-matrix-table">
              <thead>
                <tr>
                  <th className="feature-header-cell">Parameters & Metrics</th>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = selectedColleges[slotIndex];
                    return (
                      <th key={slotIndex} className="college-header-cell">
                        {college ? (
                          <div className="college-header-card">
                            <button
                              className="btn-remove-college"
                              onClick={() => handleRemoveSlot(slotIndex)}
                              title="Remove from comparison"
                            >
                              <X size={14} />
                            </button>
                            <img
                              src={college.bannerImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&auto=format&fit=crop&q=80'}
                              alt={college.name}
                              className="matrix-col-img"
                            />
                            <div className="matrix-col-info">
                              <span className="matrix-code-badge">{college.code}</span>
                              <h4 className="matrix-college-name">{college.name}</h4>
                              <Link
                                to={`/colleges/${college.slug || college._id}`}
                                className="matrix-profile-link"
                              >
                                <span>View Details</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-slot-card">
                            <Plus size={24} className="slot-plus-icon" />
                            <p className="empty-slot-text">Empty Slot {slotIndex + 1}</p>
                            <span className="slot-hint">Add above</span>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Row: Verification & Rating */}
                <tr>
                  <td className="metric-row-title">Verification & Rating</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c ? (
                          <div className="matrix-inline-cell">
                            {c.isVerified ? (
                              <Badge type="success" size="sm" icon={ShieldCheck} label="Verified" />
                            ) : (
                              <Badge type="warning" size="sm" label="Pending Verification" />
                            )}
                            <div className="rating-pill">
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                              <span>{c.rating ? c.rating.toFixed(1) : '4.4'}</span>
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: District & City */}
                <tr>
                  <td className="metric-row-title">Location & District</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c ? `${c.district}, Telangana` : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Affiliation */}
                <tr>
                  <td className="metric-row-title">University Affiliation</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c ? c.affiliation : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Type */}
                <tr>
                  <td className="metric-row-title">Institution Type</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell font-semibold">
                        {c ? c.type : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Accreditations */}
                <tr>
                  <td className="metric-row-title">Accreditations</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c ? (
                          <div className="matrix-tags-wrap">
                            {c.accreditation?.map((a, idx) => (
                              <span key={idx} className="matrix-acc-tag">{a}</span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Highest Placement */}
                <tr>
                  <td className="metric-row-title">Highest Placement Package</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell highlight-green">
                        {c?.placementStats?.highestPackage
                          ? `₹${c.placementStats.highestPackage} LPA`
                          : '₹24.0 LPA'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Average Placement */}
                <tr>
                  <td className="metric-row-title">Average Package</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell font-bold">
                        {c?.placementStats?.averagePackage
                          ? `₹${c.placementStats.averagePackage} LPA`
                          : '₹5.5 LPA'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Key Recruiters */}
                <tr>
                  <td className="metric-row-title">Top Campus Recruiters</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c?.placementStats?.topRecruiters?.length > 0 ? (
                          <div className="matrix-recruiters-list">
                            {c.placementStats.topRecruiters.join(', ')}
                          </div>
                        ) : 'TCS, Infosys, Wipro, Cognizant'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Establishment Year */}
                <tr>
                  <td className="metric-row-title">Established Year</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c?.establishmentYear || '1999'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Official Website */}
                <tr>
                  <td className="metric-row-title">Official Website</td>
                  {[0, 1, 2].map((i) => {
                    const c = selectedColleges[i];
                    return (
                      <td key={i} className="metric-data-cell">
                        {c?.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noreferrer"
                            className="matrix-web-link"
                          >
                            Visit Site
                          </a>
                        ) : '-'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareColleges;

