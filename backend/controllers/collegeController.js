const College = require('../models/College');
const Course = require('../models/Course');
const Review = require('../models/Review');
const Subscription = require('../models/Subscription');
const { logActivity } = require('../utils/logger');

// @desc    Get all colleges with search, filters, pagination
// @route   GET /api/colleges
// @access  Public
exports.getColleges = async (req, res, next) => {
  try {
    const {
      search,
      district,
      type,
      affiliation,
      isVerified,
      featured,
      approvedStatus,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Standard public query defaults to approved colleges only
    // Super admins can pass approvedStatus='all' or specific status
    if (approvedStatus && approvedStatus !== 'all') {
      query.approvedStatus = approvedStatus;
    } else if (!approvedStatus) {
      query.approvedStatus = 'approved';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (district && district !== 'All') {
      query.district = { $regex: district, $options: 'i' };
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (affiliation && affiliation !== 'All') {
      query.affiliation = { $regex: affiliation, $options: 'i' };
    }

    if (isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true';
    }

    if (featured !== undefined && featured !== '') {
      query.featured = featured === 'true';
    }

    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions.rating = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'year') {
      sortOptions.establishmentYear = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'reviews') {
      sortOptions.reviewsCount = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    }

    const currentPage = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 12;
    const skip = (currentPage - 1) * pageLimit;

    const total = await College.countDocuments(query);
    const colleges = await College.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: colleges.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage,
      data: colleges,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single college by ID or Slug
// @route   GET /api/colleges/:idOrSlug
// @access  Public
exports.getCollege = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let college;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      college = await College.findById(idOrSlug).populate('collegeAdmin', 'name email phone');
    } else {
      college = await College.findOne({ slug: idOrSlug.toLowerCase() }).populate('collegeAdmin', 'name email phone');
    }

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    // Fetch related active courses
    const courses = await Course.find({ college: college._id, isActive: true });

    // Fetch approved reviews
    const reviews = await Review.find({ college: college._id, status: 'approved' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Fetch active subscription status
    const activeSub = await Subscription.findOne({
      college: college._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).populate('plan');

    res.status(200).json({
      success: true,
      data: {
        ...college.toObject(),
        courses,
        reviews,
        activeSubscription: activeSub,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new college
// @route   POST /api/colleges
// @access  Private (Super Admin)
exports.createCollege = async (req, res, next) => {
  try {
    const existing = await College.findOne({
      $or: [{ code: req.body.code.toUpperCase() }, { name: req.body.name }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A college with this name or code already exists',
      });
    }

    const college = await College.create(req.body);

    await logActivity({
      user: req.user,
      action: 'COLLEGE_CREATED',
      targetType: 'College',
      targetId: college._id.toString(),
      details: { name: college.name, code: college.code },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      data: college,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update college details (Data isolation enforced)
// @route   PUT /api/colleges/:id
// @access  Private (Super Admin or College Admin for their own college)
exports.updateCollege = async (req, res, next) => {
  try {
    const collegeId = req.params.id;
    let college = await College.findById(collegeId);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Role-based authorization & data isolation
    if (req.user.role === 'college_admin') {
      if (req.user.collegeId?.toString() !== college._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only update your assigned college',
        });
      }

      // Restrict College Admin from modifying approval/verification/featured statuses
      delete req.body.approvedStatus;
      delete req.body.isVerified;
      delete req.body.featured;
    }

    college = await College.findByIdAndUpdate(collegeId, req.body, {
      new: true,
      runValidators: true,
    });

    await logActivity({
      user: req.user,
      action: 'COLLEGE_UPDATED',
      targetType: 'College',
      targetId: college._id.toString(),
      details: { name: college.name },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'College updated successfully',
      data: college,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Super Admin update college verification / approval / featured
// @route   PATCH /api/colleges/:id/status
// @access  Private (Super Admin)
exports.updateCollegeStatus = async (req, res, next) => {
  try {
    const { approvedStatus, isVerified, featured } = req.body;
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    if (approvedStatus !== undefined) college.approvedStatus = approvedStatus;
    if (isVerified !== undefined) college.isVerified = isVerified;
    if (featured !== undefined) college.featured = featured;

    await college.save();

    await logActivity({
      user: req.user,
      action: 'COLLEGE_STATUS_UPDATED',
      targetType: 'College',
      targetId: college._id.toString(),
      details: { approvedStatus, isVerified, featured },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'College status updated successfully',
      data: college,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private (Super Admin)
exports.deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Cascade delete associated courses & reviews
    await Course.deleteMany({ college: college._id });
    await Review.deleteMany({ college: college._id });
    await college.deleteOne();

    await logActivity({
      user: req.user,
      action: 'COLLEGE_DELETED',
      targetType: 'College',
      targetId: req.params.id,
      details: { name: college.name },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'College and associated data removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get distinct districts for filtering
// @route   GET /api/colleges/meta/districts
// @access  Public
exports.getDistricts = async (req, res, next) => {
  try {
    const districts = await College.distinct('district');
    res.status(200).json({
      success: true,
      data: districts.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
};

