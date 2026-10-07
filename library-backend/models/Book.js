const mongoose = require('mongoose');
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
module.exports = mongoose.model('Book', schema);
