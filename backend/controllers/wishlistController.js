const User = require('../models/User');

// @route  GET /api/wishlist
// @access Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    return res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error.message);
    return res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

// @route  POST /api/wishlist/:productId
// @access Private
// Toggles a product in/out of the user's wishlist
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;
    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    let added;
    if (index >= 0) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    const populated = await user.populate('wishlist');
    return res.status(200).json({ wishlist: populated.wishlist, added });
  } catch (error) {
    console.error('Toggle wishlist error:', error.message);
    return res.status(500).json({ message: 'Server error updating wishlist' });
  }
};

module.exports = { getWishlist, toggleWishlist };
