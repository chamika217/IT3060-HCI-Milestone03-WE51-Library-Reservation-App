const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['reserved', 'checked-in', 'completed', 'cancelled', 'released', 'no-show'],
      default: 'reserved',
    },
    checkInToken: { type: String },
    checkInPin: { type: String },
    checkedInAt: { type: Date },
    extensionsUsed: { type: Number, default: 0, max: 2 },
    deskDelivery: {
      requested: { type: Boolean, default: false },
      bookTitle: { type: String, trim: true },
    },
    releasedAt: { type: Date },
  },
  { timestamps: true, collection: 'sb_reservations' }
);

reservationSchema.index({ seat: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);