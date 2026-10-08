const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  pickupDate: { type: String },
  pickupWindow: { type: String },
  pickupCode: { type: String },
}, { _id: false });

const bookSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId() },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, trim: true, default: '' },
  // Teammate catalogue records use category labels; admin records use Category IDs.
  category: { type: mongoose.Schema.Types.Mixed, ref: 'Category' },
  description: { type: String, default: '' },
  color: { type: String, default: '#E8EEF9' },
  cover: { type: Number, min: 0 },
  copies: { type: Number, default: 1, min: 0 },
  // Admin inventory count; publicBook derives the reader-facing boolean from copies.
  available: { type: Number, default: 1, min: 0 },
  reservations: { type: [reservationSchema], default: [], select: false },
}, { timestamps: true });

bookSchema.index({ 'reservations.userId': 1 });
bookSchema.index(
  { isbn: 1 },
  { unique: true, partialFilterExpression: { isbn: { $type: 'string', $gt: '' } } },
);

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
