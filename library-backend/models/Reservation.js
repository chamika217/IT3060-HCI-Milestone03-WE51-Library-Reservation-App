const mongoose = require('mongoose');
const { Schema } = mongoose;
module.exports = mongoose.models.Reservation || mongoose.model('Reservation', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Book', 'Seat'], required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  seat: { type: Schema.Types.ObjectId, ref: 'Seat' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { timestamps: true }));