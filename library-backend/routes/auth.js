const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/** Sign a JWT that lasts 7 days */
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, studentId, program, semester } = req.body;

    if (!fullName || !email || !password || !studentId) {
      return res.status(400).json({ message: 'fullName, email, password and studentId are required.' });
    }

    const existing = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'studentId';
      return res.status(409).json({ message: `A user with that ${field} already exists.` });
    }

    const user = await User.create({
      fullName,
      email,
      password,   // hashed by the pre-save hook in User.js
      phone:    phone    || '',
      studentId,
      program:  program  || '',
      semester: semester || '',
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        studentId: user.studentId,
      },
    });
  } catch (err) {
    console.error('POST /auth/register', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        studentId: user.studentId,
        role:      user.role,
      },
    });
  } catch (err) {
    console.error('POST /auth/login', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
