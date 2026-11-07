const User = require('../models/User');
const { logActivity } = require('../utils/logger');

// @desc    Get all users with filter & search
// @route   GET /api/users
// @access  Private (Super Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('collegeId', 'name code district')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status / role
// @route   PATCH /api/users/:id
// @access  Private (Super Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, role, collegeId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    if (collegeId !== undefined) user.collegeId = collegeId;

    await user.save();

    await logActivity({
      user: req.user,
      action: 'USER_STATUS_UPDATED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, isActive, role },
      ip: req.ip,
    });

    res.status(200).json({ success: true, message: 'User status updated', data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own super admin account' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    next(err);
  }
};

