const Course = require('../models/Course');
const College = require('../models/College');
const Subscription = require('../models/Subscription');
const { logActivity } = require('../utils/logger');

// @desc    Get courses for a college or list all
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { collegeId, degree, search } = req.query;
    const query = { isActive: true };

    if (collegeId) {
      query.college = collegeId;
    }

    if (degree) {
      query.degree = degree;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query).populate('college', 'name code district');
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('college', 'name code district');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (College Admin or Super Admin)
exports.createCourse = async (req, res, next) => {
  try {
    let collegeId = req.body.college;

    // College admin isolation
    if (req.user.role === 'college_admin') {
      collegeId = req.user.collegeId;
      if (!collegeId) {
        return res.status(403).json({
          success: false,
          message: 'No college linked to your admin account',
        });
      }
      req.body.college = collegeId;
    }

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College ID is required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Check SaaS plan limit for College Admins
    if (req.user.role === 'college_admin') {
      const activeSub = await Subscription.findOne({
        college: collegeId,
        status: 'active',
      }).populate('plan');

      const maxAllowed = activeSub && activeSub.plan ? activeSub.plan.maxCourses : 5;
      const currentCourseCount = await Course.countDocuments({ college: collegeId });

      if (currentCourseCount >= maxAllowed) {
        return res.status(403).json({
          success: false,
          message: `Your current subscription plan allows a maximum of ${maxAllowed} courses. Please upgrade your plan in the Subscription tab to add more courses.`,
        });
      }
    }

    const course = await Course.create(req.body);

    await logActivity({
      user: req.user,
      action: 'COURSE_CREATED',
      targetType: 'Course',
      targetId: course._id.toString(),
      details: { name: course.name, college: college.name },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Course added successfully',
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (College Admin for own college or Super Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Isolation check
    if (req.user.role === 'college_admin') {
      if (course.college.toString() !== req.user.collegeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only manage courses for your own college',
        });
      }
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (College Admin for own college or Super Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'college_admin') {
      if (course.college.toString() !== req.user.collegeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only delete courses for your own college',
        });
      }
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

