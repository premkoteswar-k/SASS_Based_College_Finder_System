const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  updateCollegeStatus,
  deleteCollege,
  getDistricts,
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/meta/districts', getDistricts);
router.get('/', getColleges);
router.get('/:idOrSlug', getCollege);

// Super Admin creates college
router.post('/', protect, authorize('super_admin'), createCollege);

// Update college: Super Admin or College Admin (data isolation verified in controller)
router.put('/:id', protect, authorize('super_admin', 'college_admin'), updateCollege);

// Super Admin approves/rejects/verifies
router.patch('/:id/status', protect, authorize('super_admin'), updateCollegeStatus);

// Super Admin deletes college
router.delete('/:id', protect, authorize('super_admin'), deleteCollege);

module.exports = router;

