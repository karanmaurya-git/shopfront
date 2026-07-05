const Product = require('../models/Product');

// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error.message);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @route  GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Get product error:', error.message);
    return res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @route  POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, images, onSale, salePrice, saleEndsAt } = req.body;
    if (!name || !description || price == null || !category) {
      return res.status(400).json({ message: 'Please provide name, description, price, and category' });
    }
    const cleanImages = Array.isArray(images) ? images.filter((url) => url && url.trim()) : [];
    const product = await Product.create({
      name, description, price, category, stock,
      imageUrl: imageUrl || cleanImages[0] || '',
      images: cleanImages,
      onSale: !!onSale,
      salePrice: salePrice || undefined,
      saleEndsAt: saleEndsAt || undefined,
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error.message);
    return res.status(500).json({ message: 'Server error creating product' });
  }
};

// @route  PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    Object.assign(product, req.body);
    const updated = await product.save();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update product error:', error.message);
    return res.status(500).json({ message: 'Server error updating product' });
  }
};

// @route  DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    return res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    return res.status(500).json({ message: 'Server error deleting product' });
  }
};

// @route  GET /api/products/categories/list
// @access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    return res.status(500).json({ message: 'Server error fetching categories' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
