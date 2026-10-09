const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userId: { type: String },
  type: { type: String, enum: ['Book', 'Seat', 'book', 'seat'] },
  book: { type: Schema.Types.Mixed, ref: 'Book' },
  seat: { type: Schema.Types.ObjectId, ref: 'Seat' },
  // Admin reservation states and lowercase seat-booking lifecycle states coexist.
  status: {
    type: String,
    enum: [
      'Pending', 'Confirmed', 'Cancelled', 'Completed',
      'reserved', 'checked-in', 'completed', 'cancelled', 'released', 'no-show',
    ],
    default: 'Pending',
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  // Book holds use pickup windows; seat reservations use startTime/endTime.
  pickupDate: { type: String },
  pickupWindow: { type: String },
  pickupCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
