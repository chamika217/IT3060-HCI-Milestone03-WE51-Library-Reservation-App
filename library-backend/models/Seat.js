const mongoose = require('mongoose');
const seatSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true, trim: true },
  room: { type: String, default: 'Main Reading Room' },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
  seatNumber: { type: String, trim: true },
  pod: { type: String, trim: true },
  features: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.models.Seat || mongoose.model('Seat', seatSchema);
