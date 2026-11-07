const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/:id', getCourse);

// Add course: College Admin or Super Admin
router.post('/', protect, authorize('super_admin', 'college_admin'), createCourse);

// Update course: College Admin (isolated) or Super Admin
router.put('/:id', protect, authorize('super_admin', 'college_admin'), updateCourse);

// Delete course: College Admin (isolated) or Super Admin
router.delete('/:id', protect, authorize('super_admin', 'college_admin'), deleteCourse);

module.exports = router;

