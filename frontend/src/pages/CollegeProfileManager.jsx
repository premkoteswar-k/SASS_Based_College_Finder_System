import React, { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Globe, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { collegeApi, authApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import './CollegeProfileManager.css';

const allFacilityOptions = [
  'Modern Smart Classrooms',
  'Advanced Computing & AI Labs',
  'Central Library with IEEE Digital Access',
  'Hostel Facilities for Boys and Girls',
  'Fleet of College Buses across Hyderabad & Suburbs',
  'Indoor & Outdoor Sports Complexes',
  'Dedicated Training & Placement Cell',
  'Cafeteria and Hygienic Food Court',
  'High-Speed Wi-Fi Campus',
  'Robotics & IoT Innovation Hub',
  'Gymnasium & Health Care Centre',
  'Auditorium & Seminar Halls',
];

const CollegeProfileManager = () => {
  const { user } = useAuth();
  const [collegeId, setCollegeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    name: '',
    code: '',
    tagline: '',
    about: '',
    type: 'Affiliated',
    affiliation: '',
    district: '',
    city: '',
    address: '',
    pincode: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    logo: '',
    bannerImage: '',
    facilities: [],
    highestPackage: 0,
    averagePackage: 0,
    placementPercentage: 0,
    topRecruitersStr: '',
  });

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        setLoading(true);
        // Fetch current user details to get assigned college
        const meRes = await authApi.getMe();
        const cid = meRes.user?.collegeId;
        if (!cid) {
          throw new Error('No college profile assigned to your account');
        }
        setCollegeId(cid);

        const res = await collegeApi.getOne(cid);
        const c = res.data;

        setForm({
          name: c.name || '',
          code: c.code || '',
          tagline: c.tagline || '',
          about: c.about || '',
          type: c.type || 'Affiliated',
          affiliation: c.affiliation || '',
          district: c.district || '',
          city: c.city || '',
          address: c.address || '',
          pincode: c.pincode || '',
          website: c.website || '',
          contactEmail: c.contactEmail || '',
          contactPhone: c.contactPhone || '',
          logo: c.logo || '',
          bannerImage: c.bannerImage || '',
          facilities: c.facilities || [],
          highestPackage: c.placementStats?.highestPackage || 0,
          averagePackage: c.placementStats?.averagePackage || 0,
          placementPercentage: c.placementStats?.placementPercentage || 0,
          topRecruitersStr: (c.placementStats?.topRecruiters || []).join(', '),
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setStatusMessage({ text: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, []);

  const handleFacilityToggle = (facility) => {
    if (form.facilities.includes(facility)) {
      setForm({ ...form, facilities: form.facilities.filter((f) => f !== facility) });
    } else {
      setForm({ ...form, facilities: [...form.facilities, facility] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage({ text: '', type: '' });

      const payload = {
        name: form.name,
        tagline: form.tagline,
        about: form.about,
        type: form.type,
        affiliation: form.affiliation,
        district: form.district,
        city: form.city,
        address: form.address,
        pincode: form.pincode,
        website: form.website,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        logo: form.logo,
        bannerImage: form.bannerImage,
        facilities: form.facilities,
        placementStats: {
          highestPackage: Number(form.highestPackage),
          averagePackage: Number(form.averagePackage),
          placementPercentage: Number(form.placementPercentage),
          topRecruiters: form.topRecruitersStr.split(',').map((s) => s.trim()).filter(Boolean),
        },
      };

      await collegeApi.update(collegeId, payload);
      setStatusMessage({ text: 'College profile updated successfully!', type: 'success' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to save changes', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        <div className="profile-manager-header">
          <div>
            <h1 className="profile-title">Manage College Profile & Infrastructure</h1>
            <p className="profile-subtitle">
              Update institutional credentials, cutoffs, campus facilities, and audited placement numbers.
            </p>
          </div>
        </div>

        {statusMessage.text && (
          <div
            className={`profile-alert-banner ${
              statusMessage.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {loading ? (
          <div className="profile-loading-state">
            <div className="spinner-circle"></div>
            <p>Loading college profile details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form-grid">
            {/* Card 1: Core Details */}
            <div className="profile-section-card">
              <h3 className="section-title">Institutional Overview</h3>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">College Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College Code (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={form.code}
                    className="form-input input-disabled"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Excellence in Technical Education"
                />
              </div>

              <div className="form-group">
                <label className="form-label">About the Institution</label>
                <textarea
                  rows={4}
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  className="form-textarea"
                  placeholder="Describe your campus, labs, research centres, and faculty credentials..."
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Institution Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="form-select"
                  >
                    <option value="Autonomous">Autonomous</option>
                    <option value="Affiliated">Affiliated</option>
                    <option value="University College">University College</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">University Affiliation</label>
                  <input
                    type="text"
                    value={form.affiliation}
                    onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Jawaharlal Nehru Technological University Hyderabad (JNTUH)"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Campus Location & Contact */}
            <div className="profile-section-card">
              <h3 className="section-title">Location & Contact Desk</h3>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">District in Telangana *</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Yadadri Bhuvanagiri or Hyderabad"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City / Mandal</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Deshmukhi, Pochampally"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Campus Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="form-input"
                    placeholder="Vignan Hills, Deshmukhi"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="form-input"
                    placeholder="508284"
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Official Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="form-input"
                    placeholder="https://vignanits.ac.in"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Admissions Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="form-input"
                    placeholder="admissions@vignanits.ac.in"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="form-input"
                    placeholder="08685-226128"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Placement Track */}
            <div className="profile-section-card">
              <h3 className="section-title">Audited Placement Statistics</h3>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Highest Package (in LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.highestPackage}
                    onChange={(e) => setForm({ ...form, highestPackage: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Average Package (in LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.averagePackage}
                    onChange={(e) => setForm({ ...form, averagePackage: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Percentage (%)</label>
                  <input
                    type="number"
                    max={100}
                    value={form.placementPercentage}
                    onChange={(e) => setForm({ ...form, placementPercentage: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Top Recruiters (Comma Separated)</label>
                <input
                  type="text"
                  value={form.topRecruitersStr}
                  onChange={(e) => setForm({ ...form, topRecruitersStr: e.target.value })}
                  className="form-input"
                  placeholder="e.g. TCS, Infosys, Cognizant, Amazon, Accenture, Wipro"
                />
              </div>
            </div>

            {/* Card 4: Campus Facilities */}
            <div className="profile-section-card">
              <h3 className="section-title">Campus Facilities & Amenities</h3>
              <p className="section-subtext">Check all facilities active on your campus:</p>

              <div className="facilities-checkbox-grid">
                {allFacilityOptions.map((fac, idx) => (
                  <label key={idx} className="facility-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.facilities.includes(fac)}
                      onChange={() => handleFacilityToggle(fac)}
                      className="custom-checkbox"
                    />
                    <span>{fac}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Card 5: Media URLs */}
            <div className="profile-section-card">
              <h3 className="section-title">Profile Branding & Images</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">College Logo Image URL</label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    className="form-input"
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Campus Banner Image URL</label>
                  <input
                    type="url"
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                    className="form-input"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="profile-save-bar">
              <button
                type="submit"
                disabled={saving}
                className="btn-save-college-profile"
              >
                <Save size={18} />
                <span>{saving ? 'Saving Changes...' : 'Save College Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default CollegeProfileManager;

