const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'collegefinder_saas_super_secret_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact super admin.',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'guest'}' does not have access to this resource`,
      });
    }
    next();
  };
};

// College data isolation middleware for College Admins
const collegeAccessControl = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next(); // Super Admin can access all colleges
  }

  if (req.user.role === 'college_admin') {
    if (!req.user.collegeId) {
      return res.status(403).json({
        success: false,
        message: 'No college is currently linked to your college admin account',
      });
    }
    // Attach collegeId strictly to req for downstream controllers
    req.collegeAdminCollegeId = req.user.collegeId.toString();
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access restricted to administrators',
  });
};

module.exports = { protect, authorize, collegeAccessControl };

