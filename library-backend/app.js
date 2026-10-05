const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8081' }));
app.use(express.json({ limit: '16kb' }));
app.get('/', (req, res) => res.send('Library Reservation API is running'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reservations', require('./routes/reservations'));
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, req, res, next) => {
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  res.status(status).json({ message: status === 500 ? 'Server error. Please try again.' : 'Invalid request body.' });
});
module.exports = app;
