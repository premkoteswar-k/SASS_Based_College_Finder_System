const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} = require('../controllers/wishlistController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('student', 'super_admin'));

router.get('/', getWishlist);
router.get('/check/:collegeId', checkWishlistStatus);
router.post('/:collegeId', addToWishlist);
router.delete('/:collegeId', removeFromWishlist);

module.exports = router;

