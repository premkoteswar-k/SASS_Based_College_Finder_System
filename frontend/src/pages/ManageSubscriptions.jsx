import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, ShieldCheck, Award, Calendar, Edit3 } from 'lucide-react';
import { subscriptionApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import './ManageSubscriptions.css';

const ManageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Plan CRUD
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    code: '',
    price: 4999,
    durationInDays: 365,
    maxCourses: 15,
    featuredListing: true,
    analyticsAccess: true,
    verifiedBadge: true,
    description: '',
    featuresStr: 'List up to 15 branches, Verified Institute Badge, Direct Admission Alerts',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, plansRes] = await Promise.all([
        subscriptionApi.getAll(),
        subscriptionApi.getPlans(),
      ]);
      setSubscriptions(subsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddPlanModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      code: '',
      price: 4999,
      durationInDays: 365,
      maxCourses: 15,
      featuredListing: true,
      analyticsAccess: true,
      verifiedBadge: true,
      description: '',
      featuresStr: 'List up to 15 branches, Verified Institute Badge, Direct Admission Alerts',
    });
    setPlanModalOpen(true);
  };

  const openEditPlanModal = (p) => {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      code: p.code,
      price: p.price,
      durationInDays: p.durationInDays || 365,
      maxCourses: p.maxCourses || 10,
      featuredListing: p.featuredListing || false,
      analyticsAccess: p.analyticsAccess || false,
      verifiedBadge: p.verifiedBadge || false,
      description: p.description || '',
      featuresStr: (p.features || []).join(', '),
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: planForm.name,
        code: planForm.code,
        price: Number(planForm.price),
        durationInDays: Number(planForm.durationInDays),
        maxCourses: Number(planForm.maxCourses),
        featuredListing: planForm.featuredListing,
        analyticsAccess: planForm.analyticsAccess,
        verifiedBadge: planForm.verifiedBadge,
        description: planForm.description,
        features: planForm.featuresStr.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan._id, payload);
      } else {
        await subscriptionApi.createPlan(payload);
      }

      setPlanModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = subscriptions
    .filter((s) => s.paymentStatus === 'completed')
    .reduce((sum, s) => sum + (s.amountPaid || 0), 0);

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="sub-management-header">
          <div>
            <h1 className="sub-man-title">SaaS Subscriptions & Plans Governance</h1>
            <p className="sub-man-sub">
              Manage subscription pricing, course allowances, feature entitlements, and view active college subscribers.
            </p>
          </div>

          <button className="btn-add-saas-plan" onClick={openAddPlanModal}>
            <Plus size={18} />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* Financial KPI Banner */}
        <div className="saas-revenue-card">
          <div className="rev-card-left">
            <span className="rev-label">Total Platform SaaS Revenue</span>
            <h2 className="rev-amount">₹{totalRevenue.toLocaleString('en-IN')}</h2>
            <p className="rev-sub">From institutional subscription renewals & growth plans.</p>
          </div>
          <div className="rev-counter-box">
            <span className="rev-counter-val">{subscriptions.length}</span>
            <span className="rev-counter-lbl">Total Enrolled Subscriptions</span>
          </div>
        </div>

        {/* Section 1: Active Subscription Plans Grid */}
        <div className="plans-management-card">
          <div className="section-title-wrap">
            <h3 className="section-title">Configured SaaS Subscription Tiers</h3>
            <p className="section-sub">Tiers published to College Admins for subscription and branch listing.</p>
          </div>

          <div className="superadmin-plans-grid">
            {plans.map((p) => (
              <div key={p._id} className="superadmin-plan-item">
                <div className="plan-item-top">
                  <h4 className="plan-item-name">{p.name}</h4>
                  <span className="plan-code-badge">{p.code}</span>
                </div>
                <div className="plan-item-price">
                  ₹{p.price.toLocaleString('en-IN')} <span>/ year</span>
                </div>
                <p className="plan-item-desc">{p.description}</p>
                <div className="plan-allowances">
                  <span>Max Courses: <strong>{p.maxCourses}</strong></span>
                  <span>Featured: <strong>{p.featuredListing ? 'Yes' : 'No'}</strong></span>
                  <span>Verified Badge: <strong>{p.verifiedBadge ? 'Yes' : 'No'}</strong></span>
                </div>

                <button
                  className="btn-edit-plan"
                  onClick={() => openEditPlanModal(p)}
                >
                  <Edit3 size={15} />
                  <span>Configure Plan</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: All Subscriptions Ledger */}
        <div className="subscriptions-ledger-card">
          <div className="section-title-wrap">
            <h3 className="section-title">Institutional Subscriptions Ledger</h3>
            <p className="section-sub">Historical and active subscriptions enrolled by colleges.</p>
          </div>

          {loading ? (
            <p className="loading-text">Loading subscriptions ledger...</p>
          ) : subscriptions.length === 0 ? (
            <p className="no-data-text">No college subscriptions recorded yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>College Name</th>
                    <th>Plan Enrolled</th>
                    <th>Amount Paid</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.college?.name || 'Unknown College'}</strong>
                      </td>
                      <td>
                        <span className="plan-pill">{sub.plan?.name || 'Standard'}</span>
                      </td>
                      <td>
                        <strong className="text-green">₹{sub.amountPaid?.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td>
                        {sub.status === 'active' ? (
                          <Badge type="success" size="sm" label="Active" />
                        ) : (
                          <Badge type="danger" size="sm" label="Expired" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create or Edit Plan */}
        <Modal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          title={editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          size="md"
        >
          <form onSubmit={handleSavePlan} className="modal-plan-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Diamond Partner"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plan Code (Unique identifier) *</label>
                <input
                  type="text"
                  required
                  value={planForm.code}
                  onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                  className="form-input"
                  placeholder="e.g. diamond_partner"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Annual Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Course Branches *</label>
                <input
                  type="number"
                  required
                  value={planForm.maxCourses}
                  onChange={(e) => setPlanForm({ ...planForm, maxCourses: Number(e.target.value) })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Plan Description</label>
              <textarea
                rows={2}
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Features (Comma Separated)</label>
              <textarea
                rows={3}
                value={planForm.featuresStr}
                onChange={(e) => setPlanForm({ ...planForm, featuresStr: e.target.value })}
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-row-3">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={planForm.featuredListing}
                  onChange={(e) => setPlanForm({ ...planForm, featuredListing: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Featured Listing</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={planForm.verifiedBadge}
                  onChange={(e) => setPlanForm({ ...planForm, verifiedBadge: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Verified Badge</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={planForm.analyticsAccess}
                  onChange={(e) => setPlanForm({ ...planForm, analyticsAccess: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Analytics Access</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-save-plan-modal"
            >
              {submitting ? 'Saving Plan...' : 'Save Subscription Plan'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ManageSubscriptions;

