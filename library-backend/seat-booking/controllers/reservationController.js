const crypto = require('crypto');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

exports.createReservation = async (req, res) => {
  try {
    const { user, seat, startTime, endTime } = req.body || {};

    if (!mongoose.isValidObjectId(user) || !mongoose.isValidObjectId(seat)) {
      return res.status(400).json({ message: 'Valid user and seat ids are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: 'Invalid start or end time' });
    }
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    const foundSeat = await Seat.findOne({ _id: seat, isActive: true });
    if (!foundSeat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    const clash = await Reservation.findOne({
      seat,
      status: { $in: ['reserved', 'checked-in'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (clash) {
      return res.status(409).json({ message: 'Seat is already booked for this time' });
    }

    const reservation = await Reservation.create({
      user,
      seat,
      startTime: start,
      endTime: end,
      checkInToken: crypto.randomBytes(8).toString('hex'),
      checkInPin: String(crypto.randomInt(0, 10000)).padStart(4, '0'),
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reservation' });
  }
};