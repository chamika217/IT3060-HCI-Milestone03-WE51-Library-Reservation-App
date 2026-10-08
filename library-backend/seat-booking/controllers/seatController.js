const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

exports.getSeats = async (req, res) => {
  try {
    const { room, start, end } = req.query;

    if (!room || !mongoose.isValidObjectId(room)) {
      return res.status(400).json({ message: 'A valid room id is required' });
    }

    const seats = await Seat.find({ room, isActive: true }).sort({ seatNumber: 1 });

    let takenIds = new Set();

    if (start && end) {
      const startTime = new Date(start);
      const endTime = new Date(end);

      if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
        return res.status(400).json({ message: 'Invalid start or end time' });
      }

      const booked = await Reservation.find({
        seat: { $in: seats.map((s) => s._id) },
        status: { $in: ['reserved', 'checked-in'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      });

      takenIds = new Set(booked.map((r) => r.seat.toString()));
    }

    const result = seats.map((seat) => ({
      ...seat.toObject(),
      status: takenIds.has(seat._id.toString()) ? 'taken' : 'available',
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load seats' });
  }
};