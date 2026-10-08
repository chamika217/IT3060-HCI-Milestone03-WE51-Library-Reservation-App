const express = require('express');
const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');
const auth = require('../middleware/auth');

const router = express.Router();

// All contact routes require auth
router.use(auth);

// ── POST /api/contact/ ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { userId, subject, message, attachmentUrl } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ message: 'userId, subject and message are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const validSubjects = ['Book Reservation', 'Seat Booking', 'Account Issue', 'General Inquiry'];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ message: `subject must be one of: ${validSubjects.join(', ')}` });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer.' });
    }

    const msg = await ContactMessage.create({ userId, subject, message, attachmentUrl });

    return res.status(201).json({ message: 'Message sent.', id: msg._id });
  } catch (err) {
    console.error('POST /contact', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/contact/:userId ──────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const messages = await ContactMessage.find({ userId }).sort({ createdAt: -1 });

    return res.json(messages);
  } catch (err) {
    console.error('GET /contact/:userId', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/contact/:id ───────────────────────────────────────────────────
// Only the owner may delete their own message.
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid message id.' });
    }

    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });

    // Ownership check — req.userId is set by the auth middleware
    if (msg.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorised to delete this message.' });
    }

    await msg.deleteOne();
    return res.json({ message: 'Message deleted.' });
  } catch (err) {
    console.error('DELETE /contact/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
