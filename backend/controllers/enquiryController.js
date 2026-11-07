const Enquiry = require('../models/Enquiry');
const College = require('../models/College');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/logger');

// @desc    Submit an admission enquiry
// @route   POST /api/enquiries
// @access  Public or Student
exports.createEnquiry = async (req, res, next) => {
  try {
    const { collegeId, courseId, name, email, phone, eamcetRank, message } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const enquiryData = {
      college: collegeId,
      course: courseId || null,
      name,
      email,
      phone,
      eamcetRank: eamcetRank || '',
      message,
      student: req.user ? req.user._id : null,
    };

    const enquiry = await Enquiry.create(enquiryData);

    // Notify College Admin if assigned
    if (college.collegeAdmin) {
      await Notification.create({
        recipient: college.collegeAdmin,
        title: 'New Admission Enquiry Received',
        message: `${name} has submitted an enquiry regarding admissions for ${college.name}.`,
        type: 'enquiry',
        link: '/college-admin/enquiries',
      });
    }

    await logActivity({
      user: req.user || null,
      action: 'ENQUIRY_SUBMITTED',
      targetType: 'Enquiry',
      targetId: enquiry._id.toString(),
      details: { college: college.name, email },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Admission enquiry submitted successfully. The college admission desk will reach out soon.',
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get enquiries with role-based isolation
// @route   GET /api/enquiries
// @access  Private
exports.getEnquiries = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'college_admin') {
      if (!req.user.collegeId) {
        return res.status(403).json({
          success: false,
          message: 'No college linked to your administrator profile',
        });
      }
      query.college = req.user.collegeId;
    } else if (req.user.role === 'super_admin') {
      if (req.query.collegeId) {
        query.college = req.query.collegeId;
      }
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const enquiries = await Enquiry.find(query)
      .populate('college', 'name code district logo')
      .populate('course', 'name degree feePerYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update enquiry status and add response notes
// @route   PATCH /api/enquiries/:id/status
// @access  Private (College Admin for own college or Super Admin)
exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, responseNote } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Role check & data isolation
    if (req.user.role === 'college_admin') {
      if (enquiry.college.toString() !== req.user.collegeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only manage enquiries for your own college',
        });
      }
    }

    if (status) enquiry.status = status;
    if (responseNote !== undefined) enquiry.responseNote = responseNote;
    enquiry.respondedAt = new Date();
    enquiry.respondedBy = req.user._id;

    await enquiry.save();

    // If enquiry was created by a registered student, notify them
    if (enquiry.student) {
      await Notification.create({
        recipient: enquiry.student,
        title: 'Status Update on Your Admission Enquiry',
        message: `Your admission enquiry has been updated to "${status}". ${responseNote ? `Note: ${responseNote}` : ''}`,
        type: 'enquiry',
        link: '/student/dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private (College Admin or Super Admin)
exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (req.user.role === 'college_admin') {
      if (enquiry.college.toString() !== req.user.collegeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only delete enquiries for your own college',
        });
      }
    }

    await enquiry.deleteOne();
    res.status(200).json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    next(err);
  }
};

