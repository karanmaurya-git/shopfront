const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route  GET /api/cart
// @access Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    return res.status(200).json(cart);
  } catch (error) {
    console.error('Get cart error:', error.message);
    return res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @route  POST /api/cart
// @body   { productId, quantity }
// @access Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate('items.product');
    return res.status(200).json(populated);
  } catch (error) {
    console.error('Add to cart error:', error.message);
    return res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @route  PUT /api/cart/:productId
// @body   { quantity }
// @access Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await cart.populate('items.product');
    return res.status(200).json(populated);
  } catch (error) {
    console.error('Update cart error:', error.message);
    return res.status(500).json({ message: 'Server error updating cart' });
  }
};

// @route  DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate('items.product');
    return res.status(200).json(populated);
  } catch (error) {
    console.error('Remove from cart error:', error.message);
    return res.status(500).json({ message: 'Server error removing item' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
