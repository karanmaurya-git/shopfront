const User = require('../models/User');

// @route  GET /api/users
// @access Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @route  PUT /api/users/:id/role
// @body   { role: 'admin' | 'user' }
// @access Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "admin" or "user"' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isOwner && role === 'user') {
      return res.status(403).json({ message: 'This account is a protected owner account and cannot lose admin access' });
    }
    if (req.params.id === req.user._id.toString() && role === 'user') {
      return res.status(400).json({ message: "You can't remove your own admin access" });
    }

    user.role = role;
    await user.save();
    return res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, isOwner: user.isOwner });
  } catch (error) {
    console.error('Update user role error:', error.message);
    return res.status(500).json({ message: 'Server error updating user role' });
  }
};

// @route  PUT /api/users/:id/status
// @body   { isActive: boolean }
// @access Admin
const toggleUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isOwner && isActive === false) {
      return res.status(403).json({ message: 'This account is a protected owner account and cannot be deactivated' });
    }
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ message: "You can't deactivate your own account" });
    }
    user.isActive = isActive;
    await user.save();
    return res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    console.error('Toggle user active error:', error.message);
    return res.status(500).json({ message: 'Server error updating account status' });
  }
};

module.exports = { getUsers, updateUserRole, toggleUserActive };
