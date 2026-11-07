const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getUsers);
router.patch('/:id', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;

