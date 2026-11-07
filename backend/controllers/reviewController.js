const Review = require('../models/Review');
const College = require('../models/College');
const { logActivity } = require('../utils/logger');

// @desc    Get reviews for a college
// @route   GET /api/reviews/college/:collegeId
// @access  Public
exports.getCollegeReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      college: req.params.collegeId,
      status: 'approved',
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Student)
exports.createReview = async (req, res, next) => {
  try {
    const { collegeId, rating, title, comment } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Check if user already reviewed this college
    const existing = await Review.findOne({ college: collegeId, user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this college',
      });
    }

    const review = await Review.create({
      college: collegeId,
      user: req.user._id,
      rating: Number(rating),
      title,
      comment,
      status: 'approved', // Auto-approved for smooth UX or pending moderation
    });

    await logActivity({
      user: req.user,
      action: 'REVIEW_SUBMITTED',
      targetType: 'Review',
      targetId: review._id.toString(),
      details: { college: college.name, rating },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for Super Admin moderation
// @route   GET /api/reviews
// @access  Private (Super Admin)
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('college', 'name code')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate review status
// @route   PATCH /api/reviews/:id/status
// @access  Private (Super Admin)
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = status;
    await review.save();

    res.status(200).json({ success: true, message: 'Review status updated', data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Super Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};

