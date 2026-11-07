const mongoose = require('mongoose');

const collegeAdminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    designation: {
      type: String,
      default: 'Principal / Registrar / Admission Head',
      trim: true,
    },
    permissions: {
      manageProfile: { type: Boolean, default: true },
      manageCourses: { type: Boolean, default: true },
      manageEnquiries: { type: Boolean, default: true },
      manageSubscription: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CollegeAdmin', collegeAdminSchema);

