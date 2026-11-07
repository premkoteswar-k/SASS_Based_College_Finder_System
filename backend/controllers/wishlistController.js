const Wishlist = require('../models/Wishlist');
const College = require('../models/College');

// @desc    Get student's wishlist
// @route   GET /api/wishlist
// @access  Private (Student)
exports.getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'college',
        select: 'name code district city rating reviewsCount logo affiliation isVerified',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items.map((i) => i.college).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add college to wishlist
// @route   POST /api/wishlist/:collegeId
// @access  Private (Student)
exports.addToWishlist = async (req, res, next) => {
  try {
    const { collegeId } = req.params;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const exists = await Wishlist.findOne({ user: req.user._id, college: collegeId });
    if (exists) {
      return res.status(200).json({
        success: true,
        message: 'College is already in your wishlist',
        isWishlisted: true,
      });
    }

    await Wishlist.create({
      user: req.user._id,
      college: collegeId,
    });

    res.status(201).json({
      success: true,
      message: 'College saved to your wishlist',
      isWishlisted: true,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove college from wishlist
// @route   DELETE /api/wishlist/:collegeId
// @access  Private (Student)
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    await Wishlist.findOneAndDelete({ user: req.user._id, college: collegeId });

    res.status(200).json({
      success: true,
      message: 'College removed from your wishlist',
      isWishlisted: false,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if a college is bookmarked
// @route   GET /api/wishlist/check/:collegeId
// @access  Private (Student)
exports.checkWishlistStatus = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const exists = await Wishlist.findOne({ user: req.user._id, college: collegeId });
    res.status(200).json({
      success: true,
      isWishlisted: !!exists,
    });
  } catch (err) {
    next(err);
  }
};

