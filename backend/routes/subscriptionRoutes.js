const express = require('express');
const router = express.Router();
const {
  getPlans,
  createPlan,
  updatePlan,
  getCurrentSubscription,
  subscribeOrUpgrade,
  getAllSubscriptions,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Public plans
router.get('/plans', getPlans);

// Super Admin plan management
router.post('/plans', protect, authorize('super_admin'), createPlan);
router.put('/plans/:id', protect, authorize('super_admin'), updatePlan);

// Super Admin view all subscriptions
router.get('/all', protect, authorize('super_admin'), getAllSubscriptions);

// College Admin subscription management
router.get('/current', protect, authorize('college_admin'), getCurrentSubscription);
router.post('/subscribe', protect, authorize('college_admin'), subscribeOrUpgrade);

module.exports = router;

