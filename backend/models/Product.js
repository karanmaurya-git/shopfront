const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: '' }, // legacy single-image field, kept for backward compatibility
    images: [{ type: String }], // preferred: supports a multi-image gallery
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number, min: 0 },
    saleEndsAt: { type: Date },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
