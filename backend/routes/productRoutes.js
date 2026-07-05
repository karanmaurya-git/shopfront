const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const validate = require('../middleware/validate');

const productValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative whole number'),
];

router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/:id', getProductById);
router.post('/', protect, admin, productValidators, validate, createProduct);
router.put('/:id', protect, admin, productValidators, validate, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

router.get('/:id/reviews', getReviews);
router.post(
  '/:id/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Please write a comment'),
  ],
  validate,
  createReview
);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

module.exports = router;
