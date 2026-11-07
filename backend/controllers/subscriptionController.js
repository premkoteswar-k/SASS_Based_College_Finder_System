const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const College = require('../models/College');
const { logActivity } = require('../utils/logger');

// @desc    Get all active subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new subscription plan
// @route   POST /api/subscriptions/plans
// @access  Private (Super Admin)
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subscription plan
// @route   PUT /api/subscriptions/plans/:id
// @access  Private (Super Admin)
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Get College Admin's current subscription
// @route   GET /api/subscriptions/current
// @access  Private (College Admin)
exports.getCurrentSubscription = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    if (!collegeId) {
      return res.status(404).json({ success: false, message: 'No college linked to admin' });
    }

    const subscription = await Subscription.findOne({
      college: collegeId,
      status: 'active',
    })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Subscribe or Upgrade plan for college
// @route   POST /api/subscriptions/subscribe
// @access  Private (College Admin)
exports.subscribeOrUpgrade = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    const { planId, billingCycle } = req.body;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'No college linked to your account' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Selected plan not found' });
    }

    // Deactivate previous active subscriptions
    await Subscription.updateMany(
      { college: collegeId, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan.durationInDays || 365));

    const subscription = await Subscription.create({
      college: collegeId,
      plan: plan._id,
      startDate,
      endDate,
      status: 'active',
      amountPaid: plan.price,
      paymentStatus: 'completed',
    });

    // If plan provides featured listing or verified badge, update college
    const college = await College.findById(collegeId);
    if (college) {
      if (plan.featuredListing) college.featured = true;
      if (plan.verifiedBadge) college.isVerified = true;
      await college.save();
    }

    await logActivity({
      user: req.user,
      action: 'SUBSCRIPTION_PURCHASED',
      targetType: 'Subscription',
      targetId: subscription._id.toString(),
      details: { plan: plan.name, amount: plan.price, college: college?.name },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}! All associated features have been unlocked.`,
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all subscriptions across platform
// @route   GET /api/subscriptions/all
// @access  Private (Super Admin)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('college', 'name code district')
      .populate('plan')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

