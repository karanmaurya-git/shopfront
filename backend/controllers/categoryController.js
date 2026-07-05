const Category = require('../models/Category');
const Product = require('../models/Product');

// @route  GET /api/categories
// @access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    return res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// @route  POST /api/categories
// @body   { name, icon, description }
// @access Admin
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const exists = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (exists) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    const category = await Category.create({ name, icon: icon || '🏷️', description });
    return res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error.message);
    return res.status(500).json({ message: 'Server error creating category' });
  }
};

// @route  PUT /api/categories/:id
// @access Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const oldName = category.name;
    Object.assign(category, req.body);
    await category.save();

    // Keep existing products in sync if the category was renamed
    if (req.body.name && req.body.name !== oldName) {
      await Product.updateMany({ category: oldName }, { category: req.body.name });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(500).json({ message: 'Server error updating category' });
  }
};

// @route  DELETE /api/categories/:id
// @access Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Can't delete — ${productCount} product(s) still use this category. Reassign or remove them first.`,
      });
    }
    await category.deleteOne();
    return res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ message: 'Server error deleting category' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
