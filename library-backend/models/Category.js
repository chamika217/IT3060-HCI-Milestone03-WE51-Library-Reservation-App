const mongoose = require('mongoose');
module.exports = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true }));