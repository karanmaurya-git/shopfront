const Review = require('../models/Review');
const Product = require('../models/Product');

// Recalculate and store a product's average rating + review count
const recalcProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const averageRating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Product.findByIdAndUpdate(productId, {
    numReviews,
    averageRating: Math.round(averageRating * 10) / 10,
  });
};

// @route  GET /api/products/:id/reviews
// @access Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    return res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @route  POST /api/products/:id/reviews
// @body   { rating, comment }
// @access Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide a rating and comment' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    await recalcProductRating(req.params.id);

    return res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error.message);
    return res.status(500).json({ message: 'Server error creating review' });
  }
};

// @route  DELETE /api/products/:id/reviews/:reviewId
// @access Private (owner only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    await recalcProductRating(req.params.id);
    return res.status(200).json({ message: 'Review removed' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    return res.status(500).json({ message: 'Server error deleting review' });
  }
};

module.exports = { getReviews, createReview, deleteReview };
