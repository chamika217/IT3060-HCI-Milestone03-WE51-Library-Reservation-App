const mongoose = require('mongoose');

/**
 * type values map to frontend NotificationType:
 *   'book'   → hold_ready
 *   'seat'   → seat_expiring | seat_released
 *   'system' → system_info
 *
 * status values:
 *   'ready'    → book hold ready for pickup
 *   'expiring' → seat about to expire
 *   'released' → seat auto-released
 *   'info'     → general system information
 */
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['book', 'seat', 'system'],
    required: true,
  },
  status: {
    type: String,
    enum: ['ready', 'expiring', 'released', 'info'],
    default: 'info',
  },
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  isRead:   { type: Boolean, default: false, index: true },
  expiresAt: { type: Date, default: null },

  // ── Rich detail payload (mirrors frontend NotificationDetail) ─────────────
  detail: {
    // book hold
    bookTitle:       String,
    bookAuthor:      String,
    isbn:            String,
    pickupLocation:  String,
    holdShelf:       String,
    holdExpiry:      String,
    daysRemaining:   Number,
    barcodeValue:    String,
    // seat
    roomName:        String,
    seatNumber:      String,
    expiresAt:       String,   // human-readable "2:15 PM"
    minutesRemaining:Number,
    // system / info
    body:            String,
  },

  createdAt: { type: Date, default: Date.now },
});

// Compound index for fast per-user, sorted queries
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
