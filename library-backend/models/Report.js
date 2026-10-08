const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });
module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
