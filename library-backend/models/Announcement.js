const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
