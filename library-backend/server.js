const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/admin/auth', require('./routes/admin/auth'));
app.use('/api/admin/books', require('./routes/admin/books'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/reservations', require('./routes/admin/reservations'));
app.use('/api/admin/seats', require('./routes/admin/seats'));
app.use('/api/admin/announcements', require('./routes/admin/announcements'));
app.use('/api/admin/stats', require('./routes/admin/stats'));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Library Reservation API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));

