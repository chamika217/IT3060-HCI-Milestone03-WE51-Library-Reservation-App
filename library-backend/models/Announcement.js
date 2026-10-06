const mongoose = require('mongoose');
module.exports = mongoose.models.Announcement || mongoose.model('Announcement', new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true }));
