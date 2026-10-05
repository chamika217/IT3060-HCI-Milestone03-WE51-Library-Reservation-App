const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, maxlength: 254 },
  studentId: { type: String, required: true, unique: true, maxlength: 50 },
  department: { type: String, required: true, maxlength: 120 },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
