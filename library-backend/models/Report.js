const mongoose = require('mongoose');
module.exports = mongoose.models.Report || mongoose.model('Report', new mongoose.Schema({
  title: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true }));