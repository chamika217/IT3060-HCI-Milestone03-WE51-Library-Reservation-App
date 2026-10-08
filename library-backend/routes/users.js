const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes in this file require a valid JWT
router.use(auth);

// ── GET /api/users/:id ────────────────────────────────────────────────────────
// Returns the full user profile (password excluded by toJSON transform).
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Build the avatarInitials from fullName
    const initials = user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    return res.json({
      id:              user._id,
      fullName:        user.fullName,
      email:           user.email,
      phone:           user.phone,
      studentId:       user.studentId,
      program:         user.program,
      semester:        user.semester,
      avatarInitials:  initials,
      isEmailVerified: true,           // extend with real verification later
      role:            user.role,
      stats:           user.stats,
      notificationPreferences: user.notificationPreferences,
      createdAt:       user.createdAt,
    });
  } catch (err) {
    console.error('GET /users/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
// Updates fullName, email, phone, program, semester.
// studentId is intentionally excluded from the allowed update fields.
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['fullName', 'email', 'phone', 'program', 'semester'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ message: 'Profile updated.', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('PUT /users/:id', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/users/:id/preferences ───────────────────────────────────────────
// Replaces the notificationPreferences sub-document.
router.put('/:id/preferences', async (req, res) => {
  try {
    const allowed = [
      'pushEnabled', 'bookHolds', 'seatAlerts',
      'dueDateReminders', 'cancellationNotices',
      'emailSummaries', 'quietHoursEnabled',
    ];

    const prefs = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) prefs[`notificationPreferences.${key}`] = req.body[key];
    }

    if (Object.keys(prefs).length === 0) {
      return res.status(400).json({ message: 'No valid preference fields provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: prefs },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      message: 'Preferences saved.',
      notificationPreferences: user.notificationPreferences,
    });
  } catch (err) {
    console.error('PUT /users/:id/preferences', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ── PUT /api/users/:id/password ───────────────────────────────────────────────
// Verifies old password then hashes and saves the new one.
router.put('/:id/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'oldPassword and newPassword are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    // findById without lean so pre-save hook fires
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const match = await user.comparePassword(oldPassword);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('PUT /users/:id/password', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
