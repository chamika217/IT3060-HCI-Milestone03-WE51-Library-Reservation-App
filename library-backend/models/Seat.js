const mongoose = require('mongoose');
module.exports = mongoose.models.Seat || mongoose.model('Seat', new mongoose.Schema({
  label: { type: String, required: true, unique: true, trim: true },
  room: { type: String, default: 'Main Reading Room' },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
}, { timestamps: true }));