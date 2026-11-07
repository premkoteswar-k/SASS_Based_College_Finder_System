const College = require('../models/College');
const User = require('../models/User');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');
const Subscription = require('../models/Subscription');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');

// @desc    Super Admin comprehensive platform analytics
// @route   GET /api/analytics/superadmin
// @access  Private (Super Admin)
exports.getSuperAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalColleges,
      approvedColleges,
      pendingColleges,
      rejectedColleges,
      totalUsers,
      totalStudents,
      totalCollegeAdmins,
      totalCourses,
      totalEnquiries,
      activeSubscriptions,
      totalReviews,
      recentLogs,
    ] = await Promise.all([
      College.countDocuments(),
      College.countDocuments({ approvedStatus: 'approved' }),
      College.countDocuments({ approvedStatus: 'pending' }),
      College.countDocuments({ approvedStatus: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'college_admin' }),
      Course.countDocuments(),
      Enquiry.countDocuments(),
      Subscription.find({ status: 'active' }).populate('plan'),
      Review.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Calculate total revenue from completed subscriptions
    const totalRevenueResult = await Subscription.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // College distribution by district
    const districtDistribution = await College.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        colleges: {
          total: totalColleges,
          approved: approvedColleges,
          pending: pendingColleges,
          rejected: rejectedColleges,
        },
        users: {
          total: totalUsers,
          students: totalStudents,
          collegeAdmins: totalCollegeAdmins,
        },
        academics: {
          totalCourses,
          totalEnquiries,
          totalReviews,
        },
        financials: {
          activeSubscriptionsCount: activeSubscriptions.length,
          totalRevenue,
        },
        districtDistribution,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    College Admin individual dashboard analytics
// @route   GET /api/analytics/collegeadmin
// @access  Private (College Admin)
exports.getCollegeAdminAnalytics = async (req, res, next) => {
  try {
    const collegeId = req.user.collegeId;
    if (!collegeId) {
      return res.status(404).json({ success: false, message: 'No college linked to your account' });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College profile not found' });
    }

    const [
      coursesCount,
      totalEnquiries,
      pendingEnquiries,
      resolvedEnquiries,
      reviewsCount,
      activeSubscription,
      recentEnquiries,
    ] = await Promise.all([
      Course.countDocuments({ college: collegeId }),
      Enquiry.countDocuments({ college: collegeId }),
      Enquiry.countDocuments({ college: collegeId, status: 'pending' }),
      Enquiry.countDocuments({ college: collegeId, status: 'resolved' }),
      Review.countDocuments({ college: collegeId }),
      Subscription.findOne({ college: collegeId, status: 'active' }).populate('plan'),
      Enquiry.find({ college: collegeId }).populate('course', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    let daysRemaining = 0;
    if (activeSubscription && activeSubscription.endDate) {
      const diffMs = new Date(activeSubscription.endDate) - new Date();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      success: true,
      data: {
        college: {
          id: college._id,
          name: college.name,
          code: college.code,
          rating: college.rating,
          isVerified: college.isVerified,
          approvedStatus: college.approvedStatus,
        },
        stats: {
          coursesCount,
          totalEnquiries,
          pendingEnquiries,
          resolvedEnquiries,
          reviewsCount,
        },
        subscription: {
          planName: activeSubscription?.plan?.name || 'Free Starter',
          maxCourses: activeSubscription?.plan?.maxCourses || 5,
          featuredListing: activeSubscription?.plan?.featuredListing || false,
          analyticsAccess: activeSubscription?.plan?.analyticsAccess || false,
          daysRemaining,
          status: activeSubscription?.status || 'inactive',
        },
        recentEnquiries,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get activity logs
// @route   GET /api/analytics/logs
// @access  Private (Super Admin)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

