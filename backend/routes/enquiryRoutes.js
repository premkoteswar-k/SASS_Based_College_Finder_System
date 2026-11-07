const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

// Optional auth for creating enquiry
router.post(
  '/',
  (req, res, next) => {
    if (req.headers.authorization) {
      return protect(req, res, next);
    }
    next();
  },
  createEnquiry
);

// Protected routes
router.get('/', protect, getEnquiries);
router.patch('/:id/status', protect, authorize('super_admin', 'college_admin'), updateEnquiryStatus);
router.delete('/:id', protect, authorize('super_admin', 'college_admin'), deleteEnquiry);

module.exports = router;

