const express = require('express');
const mongoose = require('mongoose');
const FaqFeedback = require('../models/FaqFeedback');

const router = express.Router();
// auth middleware is applied at the app level: app.use('/api/faq', auth, faqRoutes)

// ── POST /api/faq/ ────────────────────────────────────────────────────────────
// Create (or upsert) a feedback entry.
// req.userId is injected by the auth middleware.
router.post('/', async (req, res) => {
  try {
    const { faqId, helpful } = req.body;

    if (!faqId || helpful === undefined) {
      return res.status(400).json({ message: 'faqId and helpful are required.' });
    }

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({ message: 'helpful must be a boolean.' });
    }

    // Upsert: if the user already rated this FAQ, update their answer.
    const feedback = await FaqFeedback.findOneAndUpdate(
      { userId: req.userId, faqId },
      { $set: { helpful } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json({ message: 'Feedback recorded.', feedback });
  } catch (err) {
    console.error('POST /faq', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/faq/:userId ──────────────────────────────────────────────────────
// Return all feedback entries for a user so the UI can pre-populate ratings.
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const entries = await FaqFeedback.find({ userId }).sort({ createdAt: -1 });
    return res.json(entries);
  } catch (err) {
    console.error('GET /faq/:userId', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/faq/:id ───────────────────────────────────────────────────────
// Remove a feedback entry so the user can undo their rating.
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid feedback id.' });
    }

    const entry = await FaqFeedback.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Feedback not found.' });

    if (entry.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    await entry.deleteOne();
    return res.json({ message: 'Feedback removed.' });
  } catch (err) {
    console.error('DELETE /faq/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
