const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const { logActivity } = require('../utils/logger');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'collegefinder_saas_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, collegeCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Role safety: allow student and college_admin registration
    let userRole = 'student';
    let assignedCollege = null;

    if (role === 'college_admin') {
      userRole = 'college_admin';
      if (collegeCode) {
        assignedCollege = await College.findOne({ code: collegeCode.toUpperCase() });
        if (!assignedCollege) {
          return res.status(404).json({
            success: false,
            message: `College with code ${collegeCode} not found`,
          });
        }
      }
    } else if (role === 'super_admin') {
      // Super admin can only be created via seeder or if specifically authorized
      // prevent public escalation unless no users exist
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        return res.status(403).json({
          success: false,
          message: 'Super Admin registration is restricted. Please use default credentials.',
        });
      }
      userRole = 'super_admin';
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone: phone || '',
      collegeId: assignedCollege ? assignedCollege._id : null,
    });

    // If college_admin and college matched, link college to this admin
    if (assignedCollege) {
      assignedCollege.collegeAdmin = user._id;
      await assignedCollege.save();
    }

    await logActivity({
      user,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { role: user.role, email: user.email },
      ip: req.ip,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by Super Admin',
      });
    }

    await logActivity({
      user,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { role: user.role, email: user.email },
      ip: req.ip,
    });

    const token = generateToken(user._id);

    // If college_admin, populate college info
    let collegeData = null;
    if (user.role === 'college_admin' && user.collegeId) {
      collegeData = await College.findById(user.collegeId).select('name code district isVerified approvedStatus logo');
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        collegeId: user.collegeId,
        college: collegeData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let collegeData = null;
    if (user.role === 'college_admin' && user.collegeId) {
      collegeData = await College.findById(user.collegeId);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        collegeId: user.collegeId,
        college: collegeData,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        collegeId: user.collegeId,
      },
    });
  } catch (err) {
    next(err);
  }
};

