const mongoose = require('mongoose');

/**
 * FaqFeedback — records whether a user found a specific FAQ helpful.
 * One document per (userId, faqId) pair. The unique index prevents
 * duplicate submissions; the DELETE endpoint lets users undo their rating.
 */
const faqFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  faqId:   { type: String, required: true },
  helpful: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

// One rating per user per FAQ
faqFeedbackSchema.index({ userId: 1, faqId: 1 }, { unique: true });

module.exports = mongoose.models.FaqFeedback || mongoose.model('FaqFeedback', faqFeedbackSchema);
