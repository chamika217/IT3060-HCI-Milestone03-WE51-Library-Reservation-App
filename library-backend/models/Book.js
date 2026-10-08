const mongoose = require('mongoose');
module.exports = mongoose.models.Book || mongoose.model('Book', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  copies: { type: Number, default: 1, min: 0 },
  available: { type: Number, default: 1, min: 0 },
}, { timestamps: true }));
const reservation = new mongoose.Schema({
  _id: String, userId: { type: String, required: true }, pickupDate: String,
  pickupWindow: String, pickupCode: String,
}, { _id: false });
const schema = new mongoose.Schema({
  _id: String, title: String, author: String, isbn: String, category: String,
  description: String, color: String, cover: Number, copies: { type: Number, min: 0 },
  reservations: { type: [reservation], default: [], select: false },
});
schema.index({ 'reservations.userId': 1 });
schema.index({ isbn: 1 }, { unique: true, partialFilterExpression: { isbn: { $type: 'string', $gt: '' } } });
module.exports = mongoose.model('Book', schema);
