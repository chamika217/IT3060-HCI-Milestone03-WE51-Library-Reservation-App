const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// All notification routes require auth
router.use(auth);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map backend type + status + isRead to the shape the frontend expects.
 * Frontend NotificationType: hold_ready | seat_expiring | seat_released | system_info
 * Frontend NotificationStatus: unread | read | action_required
 */
function toClientShape(n) {
  // Derive frontend type
  let type = 'system_info';
  if (n.type === 'book') {
    type = 'hold_ready';
  } else if (n.type === 'seat') {
    type = n.status === 'expiring' ? 'seat_expiring' : 'seat_released';
  }

  // Derive accent colour from type
  const accentColor =
    type === 'hold_ready'    ? '#2D7CE9' :
    type === 'seat_expiring' ? '#F7A35C' :
    type === 'seat_released' ? '#F04F55' :
                               '#2D7CE9';

  // Derive quick-action label
  const quickAction = type === 'seat_expiring' ? 'Extend +1h' : undefined;

  // Human-readable relative timestamp
  const now = Date.now();
  const diffMs = now - new Date(n.createdAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let timestamp;
  if (diffMin < 60)         timestamp = `${diffMin}m ago`;
  else if (diffMin < 1440)  timestamp = `${Math.floor(diffMin / 60)}h ago`;
  else                      timestamp = 'Yesterday';

  return {
    id:          n._id,
    type,
    status:      n.isRead ? 'read' : 'unread',
    title:       n.title,
    subtitle:    n.subtitle || '',
    timestamp,
    accentColor,
    quickAction,
    detail:      n.detail ?? {},
  };
}

// ── GET /api/notifications/:userId ────────────────────────────────────────────
// Optional query: ?type=book|seat|system
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const filter = { userId };
    if (req.query.type) {
      if (!['book', 'seat', 'system'].includes(req.query.type)) {
        return res.status(400).json({ message: 'type must be book, seat, or system.' });
      }
      filter.type = req.query.type;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    return res.json(notifications.map(toClientShape));
  } catch (err) {
    console.error('GET /notifications/:userId', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/notifications/detail/:id ────────────────────────────────────────
router.get('/detail/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }

    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification not found.' });

    return res.json(toClientShape(n));
  } catch (err) {
    console.error('GET /notifications/detail/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/notifications/ ──────────────────────────────────────────────────
// Internal use: create a notification (called by reservation / booking features)
router.post('/', async (req, res) => {
  try {
    const { userId, type, status, title, subtitle, detail, expiresAt } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({ message: 'userId, type and title are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const n = await Notification.create({
      userId, type, status, title, subtitle, detail, expiresAt,
    });

    // Increment user's alert stats counter
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.alerts': 1 } });

    return res.status(201).json(toClientShape(n));
  } catch (err) {
    console.error('POST /notifications', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }

    const n = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true },
    );
    if (!n) return res.status(404).json({ message: 'Notification not found.' });

    return res.json({ message: 'Marked as read.', notification: toClientShape(n) });
  } catch (err) {
    console.error('PUT /notifications/:id/read', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/notifications/:userId/read-all ───────────────────────────────────
router.put('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId.' });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );

    // Reset the user's alerts counter to 0
    await User.findByIdAndUpdate(userId, { $set: { 'stats.alerts': 0 } });

    return res.json({ message: 'All notifications marked as read.', updated: result.modifiedCount });
  } catch (err) {
    console.error('PUT /notifications/:userId/read-all', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }

    const n = await Notification.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification not found.' });

    return res.json({ message: 'Notification deleted.' });
  } catch (err) {
    console.error('DELETE /notifications/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
