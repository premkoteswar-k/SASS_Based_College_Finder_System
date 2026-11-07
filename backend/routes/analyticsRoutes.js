const express = require('express');
const router = express.Router();
const {
  getSuperAdminAnalytics,
  getCollegeAdminAnalytics,
  getActivityLogs,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/superadmin', protect, authorize('super_admin'), getSuperAdminAnalytics);
router.get('/collegeadmin', protect, authorize('college_admin'), getCollegeAdminAnalytics);
router.get('/logs', protect, authorize('super_admin'), getActivityLogs);

module.exports = router;

