const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subject: {
    type: String,
    enum: ['Book Reservation', 'Seat Booking', 'Account Issue', 'General Inquiry'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  attachmentUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
