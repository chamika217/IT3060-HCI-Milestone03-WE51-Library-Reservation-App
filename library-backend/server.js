const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const contactRoutes      = require('./routes/contact');
const faqRoutes          = require('./routes/faq');
const auth               = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  tls: true,
  tlsInsecure: true, // dev only — disable cert verification (corporate/university proxy)
})
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    console.error(
      '\nCommon causes:\n' +
      '  1. Your IP is not whitelisted in MongoDB Atlas.\n' +
      '     Fix: Atlas dashboard → Security → Network Access → Add Current IP\n' +
      '  2. Wrong MONGODB_URI in .env\n' +
      '  3. No internet connection\n'
    );
    // Don't crash — allow the server to stay up so other routes still work
  });

// Reconnect logging
mongoose.connection.on('disconnected', () =>
  console.warn('⚠ MongoDB disconnected. Will retry automatically.'),
);
mongoose.connection.on('reconnected', () =>
  console.log('✓ MongoDB reconnected.'),
);

app.get('/', (req, res) => {
  res.send('Library Reservation API is running');
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact',       contactRoutes);
app.use('/api/faq',           auth, faqRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
