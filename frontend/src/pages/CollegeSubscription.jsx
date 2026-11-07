import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { subscriptionApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import './CollegeSubscription.css';

const CollegeSubscription = () => {
  const [currentSub, setCurrentSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [currentRes, plansRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getPlans(),
      ]);

      setCurrentSub(currentRes.data);
      setPlans(plansRes.data || []);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const handleSubscribe = async (plan) => {
    if (
      !window.confirm(
        `Confirm upgrading your college subscription to "${plan.name}" (₹${plan.price.toLocaleString('en-IN')}/year)?`
      )
    ) {
      return;
    }

    try {
      setUpgrading(true);
      setSuccessMessage('');
      const res = await subscriptionApi.subscribe({ planId: plan._id });
      setSuccessMessage(res.message);
      await loadSubscriptionData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.message || 'Failed to update subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const activePlanCode = currentSub?.plan?.code || 'free_starter';

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="sub-manager-header">
          <div>
            <h1 className="sub-title">College SaaS Subscription & Features</h1>
            <p className="sub-subtitle">
              Manage your institution's subscription tier, unlock course capacities, and enable verified badges.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="sub-success-banner">
            <CheckCircle size={20} className="success-banner-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="current-plan-card">
          <div className="current-plan-info">
            <span className="current-plan-kicker">Current Subscription Status</span>
            <div className="current-plan-title-row">
              <h2 className="current-plan-name">
                {currentSub?.plan?.name || 'Free Starter Plan'}
              </h2>
              <Badge type="success" size="md" icon={ShieldCheck} label="Active" />
            </div>

            <p className="current-plan-desc">
              {currentSub?.plan?.description ||
                'Basic college profile active on CollegeFinder directory.'}
            </p>

            <div className="current-plan-details-grid">
              <div className="sub-detail-box">
                <span className="detail-lbl">Max Courses Allowed</span>
                <span className="detail-val">
                  {currentSub?.plan?.maxCourses || 5} Branches
                </span>
              </div>
              <div className="sub-detail-box">
                <span className="detail-lbl">Featured Listing</span>
                <span className="detail-val">
                  {currentSub?.plan?.featuredListing ? 'Enabled' : 'Standard'}
                </span>
              </div>
              <div className="sub-detail-box">
                <span className="detail-lbl">Verified Badge</span>
                <span className="detail-val">
                  {currentSub?.plan?.verifiedBadge ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className="sub-detail-box">
                <span className="detail-lbl">Valid Until</span>
                <span className="detail-val">
                  {currentSub?.endDate
                    ? new Date(currentSub.endDate).toLocaleDateString()
                    : '1 Year Free Trial'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Plans Grid */}
        <div className="plans-selection-wrap">
          <h3 className="upgrade-section-heading">Available Subscription Tiers</h3>
          <p className="upgrade-section-sub">
            Switch your plan at any time. Features are unlocked instantly for your college.
          </p>

          <div className="sub-plans-grid">
            {plans.map((p) => {
              const isCurrent = p.code === activePlanCode;
              return (
                <div
                  key={p._id}
                  className={`sub-tier-card ${p.code === 'growth_pro' ? 'tier-highlight' : ''}`}
                >
                  {p.code === 'growth_pro' && (
                    <span className="tier-popular-tag">Recommended for Engineering Colleges</span>
                  )}
                  <h4 className="tier-name">{p.name}</h4>
                  <p className="tier-desc">{p.description}</p>

                  <div className="tier-price-row">
                    <span className="tier-currency">₹</span>
                    <span className="tier-price-val">
                      {p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="tier-duration">/ year</span>
                  </div>

                  <ul className="tier-features-list">
                    {p.features?.map((f, idx) => (
                      <li key={idx} className="tier-feat-item">
                        <CheckCircle size={15} className="feat-check" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`btn-tier-cta ${
                      isCurrent
                        ? 'btn-tier-active'
                        : p.code === 'growth_pro'
                        ? 'btn-tier-primary'
                        : 'btn-tier-outline'
                    }`}
                    disabled={isCurrent || upgrading}
                    onClick={() => handleSubscribe(p)}
                  >
                    {isCurrent ? 'Current Active Plan' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollegeSubscription;

