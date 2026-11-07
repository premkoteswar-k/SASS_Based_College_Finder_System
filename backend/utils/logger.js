const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user = null, action, targetType = '', targetId = '', details = {}, ip = '' }) => {
  try {
    await ActivityLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : 'System / Guest',
      userRole: user ? user.role : 'guest',
      action,
      targetType,
      targetId,
      details,
      ipAddress: ip,
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = { logActivity };

