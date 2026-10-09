require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { randomUUID } = require('node:crypto');
const auth = require('./middleware/auth');

const app = express();
app.disable('x-powered-by');

const origins = (process.env.CORS_ORIGIN || 'http://localhost:8081')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.set({
    'X-Request-ID': req.requestId,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});
app.use(cors({
  origin: origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '16kb' }));

app.get('/', (req, res) => res.json({ service: 'LibraReserve API', version: '1.0.0' }));
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ status: 'unavailable' });
  await mongoose.connection.db.command({ ping: 1 });
  return res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/seat-reservations', require('./seat-booking/routes/reservationRoutes'));
app.use('/api/rooms', require('./seat-booking/routes/roomRoutes'));
app.use('/api/seats', require('./seat-booking/routes/seatRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/faq', auth, require('./routes/faq'));

app.use('/api/admin/auth', require('./routes/admin/auth'));
app.use('/api/admin/books', require('./routes/admin/books'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/reservations', require('./routes/admin/reservations'));
app.use('/api/admin/seats', require('./routes/admin/seats'));
app.use('/api/admin/announcements', require('./routes/admin/announcements'));
app.use('/api/admin/stats', require('./routes/admin/stats'));

app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, req, res, next) => {
  const status = error.status === 400 || error.status === 413
    ? error.status
    : error.name === 'ValidationError' || error.name === 'CastError'
      ? 400
      : 500;
  if (status === 500) console.error(JSON.stringify({ requestId: req.requestId, error: error.name || 'Error' }));
  return res.status(status).json({
    message: status === 500
      ? 'Server error. Please try again.'
      : status === 413
        ? 'Request body is too large.'
        : 'Invalid request data.',
    requestId: req.requestId,
  });
});

module.exports = app;
