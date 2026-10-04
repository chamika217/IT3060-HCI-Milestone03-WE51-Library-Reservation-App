const mongoose = require('mongoose');
module.exports = mongoose.models.Book || mongoose.model('Book', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  copies: { type: Number, default: 1, min: 0 },
  available: { type: Number, default: 1, min: 0 },
}, { timestamps: true }));