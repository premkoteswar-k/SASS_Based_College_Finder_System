const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      default: 0,
    },
    billingCycle: {
      type: String,
      default: 'Yearly',
    },
    durationInDays: {
      type: Number,
      default: 365,
    },
    maxCourses: {
      type: Number,
      default: 10,
    },
    featuredListing: {
      type: Boolean,
      default: false,
    },
    analyticsAccess: {
      type: Boolean,
      default: false,
    },
    prioritySupport: {
      type: Boolean,
      default: false,
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
    directEnquiryAlerts: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

