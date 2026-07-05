const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, toggleUserActive } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', protect, admin, getUsers);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/status', protect, admin, toggleUserActive);

module.exports = router;
