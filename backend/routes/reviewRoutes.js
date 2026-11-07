const express = require('express');
const router = express.Router();
const {
  getCollegeReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/college/:collegeId', getCollegeReviews);

// Student submits review
router.post('/', protect, authorize('student', 'super_admin'), createReview);

// Super Admin review moderation
router.get('/', protect, authorize('super_admin'), getAllReviews);
router.patch('/:id/status', protect, authorize('super_admin'), updateReviewStatus);
router.delete('/:id', protect, authorize('super_admin'), deleteReview);

module.exports = router;

