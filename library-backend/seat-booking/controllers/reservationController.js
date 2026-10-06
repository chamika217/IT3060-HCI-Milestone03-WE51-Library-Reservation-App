const crypto = require('crypto');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
require('../models/Room');

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
exports.getMyReservations = async (req, res) => {
  try {
    const { user, scope } = req.query;

    if (!mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'A valid user id is required' });
    }

    const now = new Date();
    let filter = { user };
    let order = { startTime: -1 };

    if (scope === 'active') {
      filter = {
        user,
        status: { $in: ['reserved', 'checked-in'] },
        endTime: { $gt: now },
      };
      order = { startTime: 1 };
    } else if (scope === 'past') {
      filter = {
        user,
        $or: [
          { status: { $nin: ['reserved', 'checked-in'] } },
          { endTime: { $lte: now } },
        ],
      };
    }

    const reservations = await Reservation.find(filter)
      .sort(order)
      .populate({
        path: 'seat',
        select: 'seatNumber pod features room',
        populate: { path: 'room', select: 'code name level' },
      });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load reservations' });
  }
};
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'reserved') {
      return res.status(400).json({ message: 'Only a reserved booking can be cancelled' });
    }
    if (reservation.endTime <= new Date()) {
      return res.status(400).json({ message: 'This booking has already ended' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel reservation' });
  }
};