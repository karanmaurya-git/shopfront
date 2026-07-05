const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusEmail } = require('../utils/emailTemplates');

// @route  POST /api/orders
// @body   { shippingAddress }
// @access Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const saleActive = product.onSale && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
      const effectivePrice = saleActive ? product.salePrice : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: effectivePrice,
      });
      totalAmount += effectivePrice * item.quantity;

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'COD',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    cart.items = [];
    await cart.save();

    // Fire-and-forget — email failure should never break the order itself
    sendEmail({
      to: req.user.email,
      subject: `Order confirmed — #${order._id.toString().slice(-6).toUpperCase()}`,
      html: orderConfirmationEmail(order, req.user.name),
    }).catch((err) => console.error('Order confirmation email error:', err.message));

    return res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error.message);
    return res.status(500).json({ message: 'Server error creating order' });
  }
};

// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Get my orders error:', error.message);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @route  GET /api/orders
// @access Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error.message);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @route  PUT /api/orders/:id
// @body   { status }
// @access Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status || order.status;
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    const updated = await order.save();

    const orderUser = await User.findById(order.user);
    if (orderUser && ['shipped', 'delivered', 'cancelled'].includes(status)) {
      sendEmail({
        to: orderUser.email,
        subject: `Order update — #${order._id.toString().slice(-6).toUpperCase()} is ${status}`,
        html: orderStatusEmail(updated, orderUser.name),
      }).catch((err) => console.error('Order status email error:', err.message));
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update order error:', error.message);
    return res.status(500).json({ message: 'Server error updating order' });
  }
};

// @route  PUT /api/orders/:id/cancel
// @access Private (owner only)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'cancelled';
    const updated = await order.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Cancel order error:', error.message);
    return res.status(500).json({ message: 'Server error cancelling order' });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder };
