const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'SeatBookingRoom', required: true },
  seatNumber: { type: String, required: true, trim: true },
  pod: { type: String, trim: true },
  features: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'sb_seats' });

seatSchema.index({ room: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.models.SeatBookingSeat
  || mongoose.model('SeatBookingSeat', seatSchema);
